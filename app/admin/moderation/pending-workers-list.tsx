import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { ADMIN_HANDYMAN_MODERATION_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";
import { prismaWhereUserPendingHandymanTruth } from "@/lib/handyman-truth";
import { WorkerModerationActions } from "./worker-moderation-actions";

export const dynamic = "force-dynamic";

export async function PendingWorkersList({
  canWriteWorkers,
}: {
  canWriteWorkers: boolean;
}) {
  try {
    const { prisma } = await import("@/lib/db");

    const handymen = await prisma.user.findMany({
      where: prismaWhereUserPendingHandymanTruth(),
      select: ADMIN_HANDYMAN_MODERATION_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Majstori na čekanju ({handymen.length})</CardTitle>
          <p className="text-sm text-[#64748B]">
            Ime, telefon, email, grad, kategorije, datum registracije
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {handymen.map((u) => (
              <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="truncate text-sm font-semibold text-slate-900">{u.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{u.email}</p>
                <p className="mt-0.5 text-xs text-slate-500">{u.phone ?? "-"} · {u.city ?? "-"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Kategorije: {u.handymanProfile?.workerCategories?.map((wc) => wc.category.name).join(", ") ?? "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString("sr")}</p>
                <div className="mt-3">
                  <WorkerModerationActions handymanId={u.id} canWriteWorkers={canWriteWorkers} />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Ime</th>
                  <th className="pb-3 pr-4">Telefon</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Kategorije</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {handymen.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{u.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{u.phone ?? "-"}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">{u.city ?? "-"}</td>
                    <td className="max-w-[150px] truncate py-3 pr-4">
                      {u.handymanProfile?.workerCategories
                        ?.map((wc) => wc.category.name)
                        .join(", ") ?? "-"}
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">
                      {new Date(u.createdAt).toLocaleDateString("sr")}
                    </td>
                    <td className="py-3">
                      <WorkerModerationActions handymanId={u.id} canWriteWorkers={canWriteWorkers} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {handymen.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Nema majstora na čekanju</p>
          )}
        </CardContent>
      </Card>
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logAdminSsrFatal("[AdminModerationSSR]", "PendingWorkersList.findMany", { tab: "workers" }, err);
    return (
      <AdminRouteLoadError
        routeTitle="Moderation"
        cardTitle="Ne možemo učitati majstore na čekanju"
        logPrefix="[AdminModerationSSR]"
        message={e.message}
        code={prismaErrorCode(err)}
        snapshot={{ segment: "pending-workers" }}
        resetHref="/admin/moderation?tab=workers"
      />
    );
  }
}
