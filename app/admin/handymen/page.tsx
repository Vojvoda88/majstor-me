import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminHandymenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; city?: string; search?: string }>;
}) {
  await requireAdminPermission("workers");
  const { prisma } = await import("@/lib/db");
  const params = await searchParams;
  const statusFilter = params.status;
  const cityFilter = params.city;
  const searchQ = params.search?.trim();

  const where: Record<string, unknown> = { role: "HANDYMAN" };
  if (statusFilter && ["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "BANNED"].includes(statusFilter)) {
    where.handymanProfile = { workerStatus: statusFilter };
  }
  if (cityFilter) where.city = cityFilter;
  if (searchQ) {
    where.OR = [
      { name: { contains: searchQ, mode: "insensitive" } },
      { phone: { contains: searchQ, mode: "insensitive" } },
      { email: { contains: searchQ, mode: "insensitive" } },
    ];
  }

  const handymen = await prisma.user.findMany({
    where,
    include: {
      handymanProfile: {
        include: {
          workerCategories: { include: { category: true } },
        },
      },
      _count: {
        select: { offers: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const withProfile = handymen.filter((h) => h.handymanProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Majstori</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje majstorima platforme</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[#64748B]">Status:</span>
        <Link href={`/admin/handymen${cityFilter ? `?city=${cityFilter}` : ""}${searchQ ? `${cityFilter ? "&" : "?"}search=${encodeURIComponent(searchQ)}` : ""}`}>
          <Badge variant={!statusFilter ? "default" : "outline"}>Svi</Badge>
        </Link>
        {(["PENDING_REVIEW", "ACTIVE", "SUSPENDED", "BANNED"] as const).map((s) => (
          <Link key={s} href={`/admin/handymen?status=${s}${cityFilter ? `&city=${cityFilter}` : ""}${searchQ ? `&search=${encodeURIComponent(searchQ)}` : ""}`}>
            <Badge variant={statusFilter === s ? "default" : "outline"}>
              {s === "PENDING_REVIEW" ? "Na čekanju" : s === "ACTIVE" ? "Aktivan" : s === "SUSPENDED" ? "Suspendovan" : "Banned"}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista majstora ({withProfile.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Ime</th>
                  <th className="pb-3 pr-4">Telefon</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Verifikacija</th>
                  <th className="pb-3 pr-4">Kategorije</th>
                  <th className="pb-3 pr-4">Krediti</th>
                  <th className="pb-3 pr-4">Ponude</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {withProfile.map((h) => {
                  const hp = h.handymanProfile!;
                  const cats = hp.workerCategories.map((wc) => wc.category.name);
                  const isSuspended = !!h.suspendedAt;
                  const isBanned = !!h.bannedAt;
                  return (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{h.name}</td>
                      <td className="py-3 pr-4">{h.phone ?? "-"}</td>
                      <td className="py-3 pr-4">{h.email}</td>
                      <td className="py-3 pr-4">{h.city ?? hp.cities[0] ?? "-"}</td>
                      <td className="py-3 pr-4">
                        {(hp.workerStatus === "BANNED" || isBanned) ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (hp.workerStatus === "SUSPENDED" || isSuspended) ? (
                          <Badge variant="secondary">Suspendovan</Badge>
                        ) : hp.workerStatus === "PENDING_REVIEW" ? (
                          <Badge variant="outline">Na čekanju</Badge>
                        ) : (
                          <Badge variant="success">Aktivan</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            hp.verifiedStatus === "VERIFIED" ? "success" : hp.verifiedStatus === "REJECTED" ? "destructive" : "secondary"
                          }
                        >
                          {hp.verifiedStatus}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">{cats.length}</td>
                      <td className="py-3 pr-4">{hp.creditsBalance}</td>
                      <td className="py-3 pr-4">{h._count.offers}</td>
                      <td className="py-3">
                        <Link href={`/admin/handymen/${h.id}`} className="text-[#2563EB] hover:underline">
                          Detalji
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {withProfile.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema majstora</p>}
        </CardContent>
      </Card>
    </div>
  );
}
