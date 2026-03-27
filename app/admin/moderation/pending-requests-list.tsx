import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { ADMIN_REQUEST_MODERATION_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";
import { RequestModerationActions } from "./request-moderation-actions";

export const dynamic = "force-dynamic";

function requestTitlePreview(title: string | null | undefined, description: string | null | undefined) {
  const s = (title ?? description ?? "").trim();
  if (!s) return "—";
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
}

export async function PendingRequestsList({
  canWriteRequests,
  canTrustSafety,
}: {
  canWriteRequests: boolean;
  canTrustSafety: boolean;
}) {
  try {
    const { prisma } = await import("@/lib/db");

    const requests = await prisma.request.findMany({
      where: {
        OR: [{ adminStatus: "PENDING_REVIEW" }, { adminStatus: null }],
        deletedAt: null,
      },
      select: ADMIN_REQUEST_MODERATION_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Zahtjevi na čekanju ({requests.length})</CardTitle>
          <p className="text-sm text-[#64748B]">
            Ime, telefon, grad, kategorija, naslov, datum
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:hidden">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {requestTitlePreview(r.title, r.description)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {r.requesterName ?? r.user?.name ?? "Guest"} · {r.city} · {r.category}
                </p>
                <p className="mt-1 text-xs text-slate-500">Telefon: {r.requesterPhone ?? "-"}</p>
                <p className="mt-1 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString("sr")}</p>
                <div className="mt-3">
                  <RequestModerationActions
                    requestId={r.id}
                    requesterPhone={r.requesterPhone}
                    canWriteRequests={canWriteRequests}
                    canTrustSafety={canTrustSafety}
                  />
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
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Kategorija</th>
                  <th className="pb-3 pr-4">Naslov</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      {r.requesterName ?? r.user?.name ?? "Guest"}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {r.requesterPhone ?? "-"}
                    </td>
                    <td className="py-3 pr-4">{r.city}</td>
                    <td className="py-3 pr-4">{r.category}</td>
                    <td className="max-w-[180px] truncate py-3 pr-4">
                      {requestTitlePreview(r.title, r.description)}
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">
                      {new Date(r.createdAt).toLocaleDateString("sr")}
                    </td>
                    <td className="py-3">
                      <RequestModerationActions
                        requestId={r.id}
                        requesterPhone={r.requesterPhone}
                        canWriteRequests={canWriteRequests}
                        canTrustSafety={canTrustSafety}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Nema zahtjeva na čekanju</p>
          )}
        </CardContent>
      </Card>
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logAdminSsrFatal("[AdminModerationSSR]", "PendingRequestsList.findMany", { tab: "requests" }, err);
    return (
      <AdminRouteLoadError
        routeTitle="Moderation"
        cardTitle="Ne možemo učitati zahtjeve na čekanju"
        logPrefix="[AdminModerationSSR]"
        message={e.message}
        code={prismaErrorCode(err)}
        snapshot={{ segment: "pending-requests" }}
        resetHref="/admin/moderation?tab=requests"
      />
    );
  }
}
