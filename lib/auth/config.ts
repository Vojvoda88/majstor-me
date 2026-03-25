import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const authStepsLog =
  process.env.LOGIN_AUTH_DEBUG === "1" || process.env.LOG_AUTH_STEPS === "1";

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          if (authStepsLog) console.warn("[auth][authorize] missing email or password");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        if (!email) return null;

        const { prisma } = await import("@/lib/db");
        /**
         * findUnique({ where: { email } }) pada ako je u bazi zapisano drugačije
         * (npr. stariji unos sa velikim slovima) — PostgreSQL unique je case-sensitive.
         * Case-insensitive lookup pokriva i novi (lowercase) i legacy zapis.
         */
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
        });

        if (!user) {
          if (authStepsLog) {
            console.warn("[auth][authorize] user not found", { emailLookup: email });
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
          select: { emailVerified: true, email: true, role: true },
        });
        if (u && u.emailVerified == null) {
          /** Admin nalozi često nemaju emailVerified (seed/ručno); blokada bi ih zaključala na mobilnom dok desktop drži staru sesiju. */
          if (u.role === "ADMIN") {
            return true;
          }
          const email = encodeURIComponent(u.email ?? "");
          return `/login?error=unverified&email=${email}`;
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
        if (u.role) token.role = u.role;
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
