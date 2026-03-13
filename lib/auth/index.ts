import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "./config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

export async function auth() {
  return getServerSession(authOptions);
}
