import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { getClientIpFromNextAuthReq } from "@/lib/request-ip";
import { isRateLimited } from "@/lib/rate-limit";

const authStepsLog =
  process.env.LOGIN_AUTH_DEBUG === "1" || process.env.LOG_AUTH_STEPS === "1";

/** Relativni redirect u signIn callback-u lomi next-auth/react (new URL bez baze). */
function authBaseUrlForClientRedirect(): string {
  const raw = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!raw) return "";
  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  return withScheme.replace(/\/$/, "");
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          if (authStepsLog) console.warn("[auth][authorize] missing email or password");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        if (!email) return null;

        const ip = getClientIpFromNextAuthReq(req);
        if (isRateLimited(`login-attempt:ip:${ip}`, 45, 15 * 60 * 1000)) {
          console.warn("[auth][authorize] rate_limited_credentials");
          return null;
        }

        const { prisma } = await import("@/lib/db");
        /**
         * findUnique({ where: { email } }) pada ako je u bazi zapisano drugačije
         * (npr. stariji unos sa velikim slovima) — PostgreSQL unique je case-sensitive.
         * Case-insensitive lookup pokriva i novi (lowercase) i legacy zapis.
         */
        /**
         * Eksplicitan select: ako produkcijska baza nije primijenila migracije za
         * email_verification_* kolone, findFirst bez select-a baca P2022 i ruši login.
         */
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            emailVerified: true,
            suspendedAt: true,
            bannedAt: true,
          },
        });

        if (!user) {
          if (authStepsLog) {
            console.warn("[auth][authorize] user not found", { emailLookup: email });
          } else {
            console.warn("[auth] credentials_rejected", { reason: "unknown_user" });
          }
          return null;
        }
        if (!user.passwordHash || user.passwordHash.length < 10) {
          if (authStepsLog) {
            console.warn("[auth][authorize] no password hash (OAuth-only / broken row?)", {
              userId: user.id,
              hasHash: !!user.passwordHash,
            });
          }
          return null;
        }

        let isValid = false;
        try {
          isValid = await compare(credentials.password, user.passwordHash);
        } catch (e) {
          console.error("[auth][authorize] bcrypt.compare threw", e);
          return null;
        }
        if (!isValid) {
          if (authStepsLog) console.warn("[auth][authorize] password mismatch", { userId: user.id });
          else console.warn("[auth] credentials_rejected", { reason: "password_mismatch", userId: user.id });
          return null;
        }

        if (user.suspendedAt || user.bannedAt) {
          if (authStepsLog) {
            console.warn("[auth][authorize] suspended or banned", {
              userId: user.id,
              suspendedAt: user.suspendedAt,
              bannedAt: user.bannedAt,
            });
          }
          return null;
        }

        if (authStepsLog) {
          console.warn("[auth][authorize] ok", { userId: user.id, role: user.role });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: null,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * Password (credentials): bez potvrđenog emaila nema sesije.
     * OAuth (npr. Google) kada se doda: provider !== credentials → ne primjenjuj ovo pravilo.
     */
    async signIn({ user, account }) {
      if (account?.provider === "credentials" && user?.id) {
        const { prisma } = await import("@/lib/db");
        const u = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { id: true, emailVerified: true, email: true, role: true },
        });
        if (u && u.emailVerified == null) {
          /** Admin nalozi često nemaju emailVerified (seed/ručno); blokada bi ih zaključala na mobilnom dok desktop drži staru sesiju. */
          if (u.role === "ADMIN") {
            return true;
          }
          const hasAdminProfile = await prisma.adminProfile.findUnique({
            where: { userId: u.id },
            select: { id: true },
          });
          if (hasAdminProfile) {
            return true;
          }
          const email = encodeURIComponent(u.email ?? "");
          const base = authBaseUrlForClientRedirect();
          if (!base) {
            if (authStepsLog) {
              console.warn(
                "[auth][signIn] email unverified but NEXTAUTH_URL unset — client redirect may break; set NEXTAUTH_URL"
              );
            }
            return `/login?error=unverified&email=${email}`;
          }
          return `${base}/login?error=unverified&email=${email}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string; email?: string; name?: string | null };
        if (u.id) {
          token.id = u.id;
          token.sub = u.id;
        }
        const { prisma } = await import("@/lib/db");
        const adminProfile = await prisma.adminProfile.findUnique({
          where: { userId: u.id as string },
          select: { id: true },
        });
        /** requireAdmin() gleda session.role; legacy redovi mogu imati AdminProfile a User.role još USER. */
        token.role = adminProfile ? "ADMIN" : (u.role ?? "USER");
        if (u.email) token.email = u.email;
        if (u.name !== undefined) token.name = u.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
        // JWT već nosi ulogu nakon prijave — ne udaraj u bazu na svakom zahtjevu
        // (to je bilo +1 query po stranici i uz connection_limit=1 često „zakucavalo” app).
        let role = token.role as string | undefined;
        if (!role || !["USER", "HANDYMAN", "ADMIN"].includes(role)) {
          const { prisma } = await import("@/lib/db");
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          role = dbUser?.role ?? role;
        }
        (session.user as { role?: string }).role = role;
        const img = (session.user as { image?: string | null }).image;
        (session.user as { image?: string | null }).image =
          typeof img === "string" && (img.startsWith("http") || img.startsWith("/")) ? img : null;
      }
      return session;
    },
  },
};
