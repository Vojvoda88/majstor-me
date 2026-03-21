import type { Session } from "next-auth";
import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { authOptions } from "./config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

/**
 * RSC, server komponente, većina GET handlera.
 * U App Routeru `getServerSession` ponekad vrati null iako JWT kolačić postoji;
 * `getToken` + `cookies()` iz next/headers čita isti token pouzdano (isti obrazac kao authFromNextRequest).
 */
export async function auth(): Promise<Session | null> {
  const fromSession = await getServerSession(authOptions);
  if (fromSession?.user?.id) return fromSession;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const cookieStore = cookies();
  const token = await getToken({
    req: {
      headers: new Headers(),
      cookies: cookieStore,
    } as unknown as NextRequest,
    secret,
  });
  if (!token) return null;
  return sessionFromJwtPayload(token as Record<string, unknown>);
}

function sessionFromJwtPayload(token: Record<string, unknown>): Session | null {
  const id =
    (typeof token.sub === "string" ? token.sub : null) ||
    (typeof token.id === "string" ? token.id : null);
  if (!id) return null;
  const role = typeof token.role === "string" ? token.role : "USER";
  return {
    user: {
      id,
      email: typeof token.email === "string" ? token.email : "",
      name: typeof token.name === "string" ? token.name : null,
      image: null,
      role,
    },
    expires:
      typeof token.exp === "number" ? new Date(token.exp * 1000).toISOString() : new Date().toISOString(),
  } as Session;
}

/**
 * Route Handler (POST/PUT/PATCH) — getServerSession(authOptions) često vrati null;
 * getToken({ req: NextRequest }) čita session JWT iz kolačića pouzdano.
 */
export async function authFromNextRequest(request: NextRequest): Promise<Session | null> {
  const fromSession = await getServerSession(authOptions);
  if (fromSession?.user?.id) return fromSession;

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const token = await getToken({ req: request, secret });
  if (!token) return null;
  return sessionFromJwtPayload(token as Record<string, unknown>);
}
