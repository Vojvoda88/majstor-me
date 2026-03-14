import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity?: string; page?: string }>;
}) {
  await requireAdminPermission("audit_log");
  const { prisma } = await import("@/lib/db");
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.action) where.actionType = params.action;
  if (params.entity) where.entityType = params.entity;

  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Audit Log</h1>
        <p className="mt-1 text-sm text-[#64748B]">Istorija svih admin akcija</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zapisi ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3 pr-4">Akcija</th>
                  <th className="pb-3 pr-4">Entitet</th>
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Admin ID</th>
                  <th className="pb-3 pr-4">Razlog</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-[#64748B]">{new Date(l.createdAt).toLocaleString("sr")}</td>
                    <td className="py-3 pr-4 font-medium">{l.actionType}</td>
                    <td className="py-3 pr-4">{l.entityType}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{l.entityId?.slice(0, 8) ?? "-"}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{l.adminId.slice(0, 8)}</td>
                    <td className="max-w-[200px] truncate py-3 pr-4">{l.reason ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema zapisa</p>}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {page > 1 && (
                <a
                  href={`/admin/audit?page=${page - 1}${params.action ? `&action=${params.action}` : ""}${params.entity ? `&entity=${params.entity}` : ""}`}
                  className="text-[#2563EB] hover:underline"
                >
                  ← Prethodna
                </a>
              )}
              <span className="px-4">
                Strana {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/admin/audit?page=${page + 1}${params.action ? `&action=${params.action}` : ""}${params.entity ? `&entity=${params.entity}` : ""}`}
                  className="text-[#2563EB] hover:underline"
                >
                  Sljedeća →
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
