import { requireAdminPermission } from "@/lib/admin/auth";
import { AdminPushEntryCard } from "@/components/admin/admin-push-entry-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await requireAdminPermission("notifications");
  const { prisma } = await import("@/lib/db");

  const pushCount = await prisma.pushSubscription.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Notifikacije</h1>
        <p className="mt-1 text-sm text-[#64748B]">Push pretplate i distribucija</p>
      </div>

      <AdminPushEntryCard />

      <Card>
        <CardHeader>
          <CardTitle>Push pretplate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{pushCount}</p>
          <p className="mt-1 text-sm text-[#64748B]">Aktivnih push pretplata (majstori)</p>
        </CardContent>
      </Card>
    </div>
  );
}
