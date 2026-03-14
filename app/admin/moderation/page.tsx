import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Na čekanju",
  REVIEWED: "Pregledano",
  RESOLVED: "Riješeno",
  DISMISSED: "Odbijeno",
};

export default async function ModerationPage() {
  await requireAdminPermission("moderation");
  const { prisma } = await import("@/lib/db");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reportedUser: { select: { id: true, name: true, email: true, role: true } },
      request: { select: { id: true, category: true, city: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Moderation Inbox</h1>
        <p className="mt-1 text-sm text-[#64748B]">Prijavljeni sadržaj i aktivnosti</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prijave</CardTitle>
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
                      <Link href={`/admin/users/${r.reporterId}`} className="hover:underline">
                        {r.reporter.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/users/${r.reportedUserId}`} className="hover:underline">
                        {r.reportedUser.name}
                      </Link>
                      {r.reportedUser.role === "HANDYMAN" && (
                        <Link href={`/admin/handymen/${r.reportedUserId}`} className="ml-1 text-[#2563EB]">
                          (majstor)
                        </Link>
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
                    <td className="py-3 pr-4 text-[#64748B]">{new Date(r.createdAt).toLocaleDateString("sr")}</td>
                    <td className="py-3">
                      <Link
                        href={`/admin/moderation/${r.id}`}
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
          {reports.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema prijava</p>}
        </CardContent>
      </Card>
    </div>
  );
}
