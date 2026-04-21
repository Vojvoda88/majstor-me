import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { getClientIpFromNextAuthReq } from "@/lib/request-ip";
import { isRateLimited } from "@/lib/rate-limit";

const authStepsLog =
  process.env.LOGIN_AUTH_DEBUG === "1" || process.env.LOG_AUTH_STEPS === "1";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma: _prismaForAdapter } = require("@/lib/db");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(_prismaForAdapter),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
    async signIn({ user, account }) {
      // For OAuth providers (Google), mark email as verified automatically
      if (account?.provider && account.provider !== "credentials" && user.id) {
        try {
          const { prisma } = await import("@/lib/db");
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        } catch {
          // ignore — user might not exist yet on very first creation (adapter handles it)
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as { id?: string; role?: string; email?: string; name?: string | null };
        if (u.id) {
          token.id = u.id;
          token.sub = u.id;
        }
        const { prisma } = await import("@/lib/db");
        const [adminProfile, dbUser] = await Promise.all([
          prisma.adminProfile.findUnique({
            where: { userId: u.id as string },
            select: { id: true },
          }),
          // Always fetch from DB so OAuth users (who have no role in token) get the right role
          prisma.user.findUnique({
            where: { id: u.id as string },
            select: { role: true },
          }),
        ]);
        token.role = adminProfile ? "ADMIN" : (dbUser?.role ?? u.role ?? "USER");
        if (u.email) token.email = u.email;
        if (u.name !== undefined) token.name = u.name;
      }
      void account;
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
