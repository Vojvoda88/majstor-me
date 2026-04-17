import type { Metadata } from "next";
import { AppProviders } from "@/app/app-providers";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * SessionProvider je već u root layoutu (app/layout.tsx). Dupli <Providers> ovdje
 * udvostručuje next-auth context i u dev modu može doprineti ChunkLoadError / 404 na layout chunku.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-[#F3F4F6] pb-24 pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pb-8">
        <PremiumMobileHeader />
        {children}
        <MobileBottomNav />
      </div>
    </AppProviders>
  );
}
