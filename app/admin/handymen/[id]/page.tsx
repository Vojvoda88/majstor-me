import { requireAdminPermission } from "@/lib/admin/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminHandymanActions } from "./admin-handyman-actions";
import { DeleteUserButton } from "./delete-user-button";

export const dynamic = "force-dynamic";

export default async function AdminHandymanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { adminRole } = await requireAdminPermission("workers");
  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  const user = await prisma.user.findUnique({
    where: { id, role: "HANDYMAN" },
    include: {
      handymanProfile: {
        include: { workerCategories: { include: { category: true } } },
      },
      offers: { include: { request: { select: { id: true, category: true, city: true } } } },
      contactUnlocks: { include: { request: { select: { id: true, category: true } } } },
      _count: { select: { offers: true } },
    },
  });

  if (!user?.handymanProfile) notFound();

  const hp = user.handymanProfile;
  const categories = hp.workerCategories.map((wc) => wc.category.name);
  const creditTx = await prisma.creditTransaction.findMany({
    where: { handymanId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">{user.name}</h1>
          <p className="mt-1 text-sm text-[#64748B]">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminHandymanActions
            handymanId={id}
            adminRole={adminRole}
            verifiedStatus={hp.verifiedStatus}
            workerStatus={hp.workerStatus}
            suspendedAt={user.suspendedAt}
            bannedAt={user.bannedAt}
          />
          <DeleteUserButton userId={id} label="Obriši nalog (majstora)" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Telefon:</strong> {user.phone ?? "-"}</p>
            <p><strong>Grad:</strong> {user.city ?? hp.cities[0] ?? "-"}</p>
            <p><strong>Status:</strong> {hp.workerStatus === "BANNED" || user.bannedAt ? "Banned" : hp.workerStatus === "SUSPENDED" || user.suspendedAt ? "Suspendovan" : hp.workerStatus === "PENDING_REVIEW" ? "Na čekanju" : "Aktivan"}</p>
            <p><strong>Verifikacija:</strong> {hp.verifiedStatus}</p>
            <p><strong>Kategorije:</strong> {categories.join(", ") || "-"}</p>
            <p><strong>Gradovi rada:</strong> {hp.cities.join(", ") || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Krediti:</strong> {hp.creditsBalance}</p>
            <p><strong>Ponude:</strong> {user._count.offers}</p>
            <p><strong>Otključanja kontakta:</strong> {user.contactUnlocks.length}</p>
            <p><strong>Završeni poslovi:</strong> {hp.completedJobsCount}</p>
            <p><strong>Ocjena:</strong> {hp.ratingAvg.toFixed(1)} ({hp.reviewCount} recenzija)</p>
          </CardContent>
        </Card>
      </div>

      {hp.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Opis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{hp.bio}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kreditna istorija</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4">Datum</th>
                  <th className="pb-2 pr-4">Tip</th>
                  <th className="pb-2 pr-4">Iznos</th>
                  <th className="pb-2 pr-4">Stanje</th>
                </tr>
              </thead>
              <tbody>
                {creditTx.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleString("sr")}</td>
                    <td className="py-2 pr-4">{t.type}</td>
                    <td className={`py-2 pr-4 ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {t.amount >= 0 ? "+" : ""}{t.amount}
                    </td>
                    <td className="py-2 pr-4">{t.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {creditTx.length === 0 && <p className="py-4 text-[#64748B]">Nema transakcija</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ponude</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {user.offers.slice(0, 10).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/requests/${o.requestId}`} className="hover:underline">
                  {o.request.category} – {o.request.city}
                </Link>
                <span className="ml-2 text-[#64748B]">{o.status}</span>
              </li>
            ))}
          </ul>
          {user.offers.length === 0 && <p className="text-[#64748B]">Nema ponuda</p>}
        </CardContent>
      </Card>
    </div>
  );
}
