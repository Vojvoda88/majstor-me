import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { ADMIN_REPORT_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Na čekanju",
  REVIEWED: "Pregledano",
  RESOLVED: "Riješeno",
  DISMISSED: "Odbijeno",
};

export async function ReportedItemsList() {
  try {
    const { prisma } = await import("@/lib/db");

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: ADMIN_REPORT_LIST_SELECT,
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Prijave ({reports.length})</CardTitle>
          <p className="text-sm text-[#64748B]">
            {reports.filter((r) => r.status === "PENDING").length} na čekanju
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Tip</th>
                  <th className="pb-3 pr-4">Prijavio</th>
                  <th className="pb-3 pr-4">Prijavljen</th>
                  <th className="pb-3 pr-4">Opis</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{r.type}</td>
                    <td className="py-3 pr-4">
                      {r.reporter ? (
                        <Link href={`/admin/users/${r.reporterId}`} className="hover:underline">
                          {r.reporter.name}
                        </Link>
                      ) : (
                        <span className="text-[#64748B]">— (ID: {r.reporterId.slice(0, 8)}…)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {r.reportedUser ? (
                        <>
                          <Link href={`/admin/users/${r.reportedUserId}`} className="hover:underline">
                            {r.reportedUser.name}
                          </Link>
                          {r.reportedUser.role === "HANDYMAN" && (
                            <Link href={`/admin/handymen/${r.reportedUserId}`} className="ml-1 text-[#2563EB]">
                              (majstor)
                            </Link>
                          )}
                        </>
                      ) : (
                        <span className="text-[#64748B]">—</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate py-3 pr-4">{r.description ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          r.status === "PENDING" ? "destructive" : r.status === "RESOLVED" ? "success" : "secondary"
                        }
                      >
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">
                      {new Date(r.createdAt).toLocaleDateString("sr")}
                    </td>
                    <td className="py-3">
                      <Link
                        href={
                          r.request?.id
                            ? `/admin/requests/${r.request.id}`
                            : `/admin/users/${r.reportedUserId}`
                        }
                        className="text-[#2563EB] hover:underline"
                      >
                        Detalji
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Nema prijava</p>
          )}
        </CardContent>
      </Card>
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logAdminSsrFatal("[AdminModerationSSR]", "ReportedItemsList.findMany", { tab: "reports" }, err);
    return (
      <AdminRouteLoadError
        routeTitle="Moderation"
        cardTitle="Ne možemo učitati prijave"
        logPrefix="[AdminModerationSSR]"
        message={e.message}
        code={prismaErrorCode(err)}
        snapshot={{ segment: "reports" }}
        resetHref="/admin/moderation?tab=reports"
      />
    );
  }
}
