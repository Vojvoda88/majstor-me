import type { Metadata } from "next";
import { AppProviders } from "@/app/app-providers";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminPendingReviewCounts } from "@/lib/admin-pending-counts";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, adminRole } = await requireAdmin();
  let pendingReview = { pendingRequests: 0, pendingHandymen: 0, urgentPendingRequests: 0 };
  try {
    pendingReview = await getAdminPendingReviewCounts();
  } catch {
    /* non-blocking */
  }

  return (
    <AppProviders>
      <AdminShell adminRole={adminRole} session={session} pendingReview={pendingReview}>
        {children}
      </AdminShell>
    </AppProviders>
  );
}
