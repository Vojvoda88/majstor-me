"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PwaProvider } from "@/components/pwa/pwa-provider";

/**
 * Providers za dashboard, admin i request – React Query + PWA.
 * Ne učitavaju se na čisto javnim stranicama (/, categories, login, register, handyman/[id], …).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PwaProvider>{children}</PwaProvider>
    </QueryClientProvider>
  );
}
