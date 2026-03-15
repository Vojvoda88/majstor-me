"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Root providers – samo Session (za header na javnim stranicama).
 * QueryClient + Pwa učitavaju se samo u dashboard, admin i request (AppProviders).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
