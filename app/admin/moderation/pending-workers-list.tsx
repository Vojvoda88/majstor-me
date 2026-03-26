import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { ADMIN_HANDYMAN_MODERATION_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";
import { prismaWhereHandymanEmailNotDemo } from "@/lib/demo-email";
import { WorkerModerationActions } from "./worker-moderation-actions";

export const dynamic = "force-dynamic";

export async function PendingWorkersList() {
  try {
    const { prisma } = await import("@/lib/db");

    const handymen = await prisma.user.findMany({
      where: {
        role: "HANDYMAN",
        ...prismaWhereHandymanEmailNotDemo(),
        handymanProfile: {
          workerStatus: "PENDING_REVIEW",
        },
      },
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
          <div className="overflow-x-auto">
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
                      <WorkerModerationActions handymanId={u.id} />
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
