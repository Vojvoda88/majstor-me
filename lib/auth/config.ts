import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

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
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        if (!email) return null;

        const { prisma } = await import("@/lib/db");
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

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
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string };
        if (u.id) token.id = u.id;
        if (u.role) token.role = u.role;
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
