import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const REPORT_STATUS: Record<string, string> = {
  PENDING: "Na čekanju",
  REVIEWED: "Pregledano",
  RESOLVED: "Riješeno",
  DISMISSED: "Odbijeno",
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const { prisma } = await import("@/lib/db");
  const reports = await prisma.report.findMany({
    include: {
      reporter: { select: { name: true, email: true } },
      reportedUser: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="page-title">Prijave</h1>
      <p className="page-description">Prijave korisnika na čekanju obrade</p>
      {reports.length === 0 ? (
        <EmptyState className="mt-6" title="Nema prijava" />
      ) : (
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium">Prijavio</th>
                  <th className="px-4 py-3 text-left font-medium">Prijavljen</th>
                  <th className="px-4 py-3 text-left font-medium">Tip</th>
                  <th className="px-4 py-3 text-left font-medium">Opis</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Zahtjev</th>
                  <th className="px-4 py-3 text-left font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">{r.reporter.name}</td>
                    <td className="px-4 py-3">
                      {r.reportedUser.name}
                      <span className="ml-1 text-muted-foreground">({r.reportedUser.email})</span>
                    </td>
                    <td className="px-4 py-3">{r.type}</td>
                    <td className="max-w-xs truncate px-4 py-3" title={r.description ?? undefined}>
                      {r.description ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "PENDING" ? "warning" :
                          r.status === "RESOLVED" ? "success" : "secondary"
                        }
                      >
                        {REPORT_STATUS[r.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {r.requestId ? (
                        <Link href={`/request/${r.requestId}`} className="text-primary hover:underline">
                          Pogledaj →
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
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
