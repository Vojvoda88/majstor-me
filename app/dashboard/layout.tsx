import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-16">
      <PremiumMobileHeader />
      {children}
    </div>
  );
}
