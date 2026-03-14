import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7FB] pt-16">
      <PremiumMobileHeader />
      {children}
    </div>
  );
}
