import { AppProviders } from "@/app/app-providers";
import { Providers } from "@/app/providers";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppProviders>
        <div className="min-h-screen bg-[#F3F4F6] pt-16">
          <PremiumMobileHeader />
          {children}
        </div>
      </AppProviders>
    </Providers>
  );
}
