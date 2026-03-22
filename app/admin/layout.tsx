import { AppProviders } from "@/app/app-providers";
import { Providers } from "@/app/providers";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, adminRole } = await requireAdmin();

  let moderationQueueCount = 0;
  if (hasPermission(adminRole, "moderation")) {
    const { prisma } = await import("@/lib/db");
    const [pendingWorkers, pendingRequests] = await Promise.all([
      prisma.user.count({
        where: { role: "HANDYMAN", handymanProfile: { workerStatus: "PENDING_REVIEW" } },
      }),
      prisma.request.count({
        where: {
          deletedAt: null,
          OR: [{ adminStatus: "PENDING_REVIEW" }, { adminStatus: null }],
        },
      }),
    ]);
    moderationQueueCount = pendingWorkers + pendingRequests;
  }

  return (
    <Providers>
      <AppProviders>
        <AdminShell
          adminRole={adminRole}
          session={session}
          moderationQueueCount={moderationQueueCount}
        >
          {children}
        </AdminShell>
      </AppProviders>
    </Providers>
  );
}
