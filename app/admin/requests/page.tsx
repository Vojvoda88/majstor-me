import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPermission("requests");
  const { prisma } = await import("@/lib/db");
  const params = await searchParams;
  const statusFilter = params.status as string | undefined;

  const where = statusFilter && ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(statusFilter)
    ? { status: statusFilter as "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }
    : {};

  const requests = await prisma.request.findMany({
    where,
    include: {
      user: { select: { name: true } },
      offers: { select: { id: true } },
      contactUnlocks: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Zahtjevi</h1>
        <p className="mt-1 text-sm text-[#64748B]">Svi zahtjevi / leadovi</p>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/requests">
          <Badge variant={!statusFilter ? "default" : "outline"}>Svi</Badge>
        </Link>
        {(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <Link key={s} href={`/admin/requests?status=${s}`}>
            <Badge variant={statusFilter === s ? "default" : "outline"}>{STATUS_LABELS[s]}</Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista zahtjeva ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Korisnik</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Kategorija</th>
                  <th className="pb-3 pr-4">Naslov</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Ponude</th>
                  <th className="pb-3 pr-4">Otključanja</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{r.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4">{r.requesterName ?? r.user?.name ?? "Guest"}</td>
                    <td className="py-3 pr-4">{r.city}</td>
                    <td className="py-3 pr-4">{r.category}</td>
                    <td className="max-w-[150px] truncate py-3 pr-4">{r.title ?? r.description.slice(0, 30)}</td>
                    <td className="py-3 pr-4 text-[#64748B]">{new Date(r.createdAt).toLocaleDateString("sr")}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          r.status === "COMPLETED" ? "success" : r.status === "CANCELLED" ? "secondary" : "default"
                        }
                      >
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{r.offers.length}</td>
                    <td className="py-3 pr-4">{r.contactUnlocks.length}</td>
                    <td className="py-3">
                      <Link href={`/admin/requests/${r.id}`} className="text-[#2563EB] hover:underline">
                        Detalji
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema zahtjeva</p>}
        </CardContent>
      </Card>
    </div>
  );
}
