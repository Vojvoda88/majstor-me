import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AdminPushCard } from "@/components/admin/admin-push-card";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const { session } = await requireAdminPermission("notifications");
  const { prisma } = await import("@/lib/db");

  const [pushCount, notifications, queue] = await Promise.all([
    prisma.pushSubscription.count({ where: { userId: session.user!.id } }),
    prisma.notification.findMany({
      where: {
        userId: session.user!.id,
        type: { startsWith: "ADMIN_" },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    Promise.all([
      prisma.user.count({
        where: { role: "HANDYMAN", handymanProfile: { workerStatus: "PENDING_REVIEW" } },
      }),
      prisma.request.count({
        where: {
          deletedAt: null,
          OR: [{ adminStatus: "PENDING_REVIEW" }, { adminStatus: null }],
        },
      }),
    ]).then(([w, r]) => ({ workers: w, requests: r, total: w + r })),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Obavještenja (admin)</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Red čekanja za moderaciju, interni feed i push na telefon
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Red čekanja (moderacija)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Majstori na pregled:</strong> {queue.workers}
            </p>
            <p>
              <strong>Zahtjevi na pregled:</strong> {queue.requests}
            </p>
            <p className="text-[#64748B]">Ukupno: {queue.total}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/admin/moderation?tab=workers"
                className="inline-flex rounded-lg bg-[#2563EB] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Otvori majstore
              </Link>
              <Link
                href="/admin/moderation?tab=requests"
                className="inline-flex rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Otvori zahtjeve
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pretplate na ovom nalogu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pushCount}</p>
            <p className="mt-1 text-sm text-[#64748B]">Aktivnih push pretplata (ovaj uređaj / sesija)</p>
          </CardContent>
        </Card>
      </div>

      <AdminPushCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interna obavještenja</CardTitle>
          <p className="text-sm text-[#64748B]">Klik vodi direktno na profil ili zahtjev</p>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-[#E2E8F0]">
            {notifications.map((n) => (
              <li key={n.id} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A]">{n.title}</p>
                  {n.body && <p className="text-sm text-[#64748B]">{n.body}</p>}
                  <p className="text-xs text-[#94A3B8]">
                    {new Date(n.createdAt).toLocaleString("sr-Latn-ME")}
                  </p>
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="shrink-0 text-sm font-semibold text-[#2563EB] hover:underline"
                  >
                    Otvori →
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {notifications.length === 0 && (
            <p className="py-6 text-center text-sm text-[#64748B]">Još nema admin obavještenja</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
