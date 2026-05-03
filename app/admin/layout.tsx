import type { Metadata } from "next";
import { AppProviders } from "@/app/app-providers";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PENDING_INITIAL = { pendingRequests: 0, pendingHandymen: 0, urgentPendingRequests: 0 };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, adminRole } = await requireAdmin();
  /** Badge brojevi se učitavaju u klijentu (AdminShell) — layout ne čeka DB za countove. */
  return (
    <AppProviders>
      <AdminShell adminRole={adminRole} session={session} pendingReview={PENDING_INITIAL}>
        {children}
      </AdminShell>
    </AppProviders>
  );
}
