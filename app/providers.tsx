"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

/**
 * Root providers – samo Session context (za header na javnim stranicama).
 * QueryClient + Pwa učitavaju se samo u dashboard, admin i request (AppProviders).
 */
export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return <SessionProvider session={session ?? undefined}>{children}</SessionProvider>;
}
