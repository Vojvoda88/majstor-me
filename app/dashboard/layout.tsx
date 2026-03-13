import { SiteHeader } from "@/components/layout/site-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader />
      {children}
    </div>
  );
}
