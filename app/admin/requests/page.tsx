import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Otvoren",
  IN_PROGRESS: "U toku",
  COMPLETED: "Završen",
  CANCELLED: "Otkazan",
};

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status;

  const { prisma } = await import("@/lib/db");
  const where = status ? { status: status as "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" } : {};

  const requests = await prisma.request.findMany({
    where,
    include: {
      user: { select: { name: true } },
      offers: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="page-title">Zahtjevi</h1>
      <p className="page-description">Pregled svih zahtjeva po statusu</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/requests">
          <Badge variant={!status ? "default" : "outline"}>Svi</Badge>
        </Link>
        {(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <Link
            key={s}
            href={status === s ? "/admin/requests" : `/admin/requests?status=${s}`}
          >
            <Badge variant={status === s ? "default" : "outline"}>{STATUS_LABELS[s]}</Badge>
          </Link>
        ))}
      </div>
      {requests.length === 0 ? (
        <EmptyState className="mt-6" title="Nema zahtjeva" description="Za izabrani filter nema rezultata." />
      ) : (
      <Card className="mt-8 border-[#E2E8F0]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Kategorija</th>
                  <th className="px-4 py-3 text-left font-medium">Korisnik</th>
                  <th className="px-4 py-3 text-left font-medium">Grad</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Ponude</th>
                  <th className="px-4 py-3 text-left font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/request/${r.id}`} className="hover:underline">
                        {r.category}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.user.name}</td>
                    <td className="px-4 py-3">{r.city}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "OPEN" ? "secondary" :
                          r.status === "IN_PROGRESS" ? "default" :
                          r.status === "COMPLETED" ? "success" :
                          "destructive"
                        }
                      >
                        {STATUS_LABELS[r.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{r.offers.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("sr")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
