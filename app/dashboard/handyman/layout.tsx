import { HandymanHomeSignOutBar } from "@/components/handyman/handyman-home-sign-out-bar";

export default function HandymanDashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HandymanHomeSignOutBar />
      {children}
    </>
  );
}
