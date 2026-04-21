import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireVerified } from "@/lib/auth/require-verified";
import { AppProviders } from "@/app/app-providers";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  await requireVerified(session);

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
