import { AppProviders } from "@/app/app-providers";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";

/**
 * SessionProvider je već u root layoutu (app/layout.tsx). Dupli <Providers> ovdje
 * udvostručuje next-auth context i u dev modu može doprinijeti ChunkLoadError / 404 na layout chunku.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-[#F3F4F6] pt-16">
        <PremiumMobileHeader />
        {children}
      </div>
    </AppProviders>
  );
}
