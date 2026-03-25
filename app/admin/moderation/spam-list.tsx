import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AdminRouteLoadError } from "@/lib/admin/admin-ssr-fallback";
import { ADMIN_REQUEST_LIST_SELECT } from "@/lib/admin/admin-prisma-selects";
import { logAdminSsrFatal, prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

function requestTitlePreview(title: string | null | undefined, description: string | null | undefined) {
  const s = (title ?? description ?? "").trim();
  if (!s) return "—";
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
}

export async function SpamList() {
  try {
    const { prisma } = await import("@/lib/db");

    const requests = await prisma.request.findMany({
      where: { adminStatus: "SPAM" },
      select: ADMIN_REQUEST_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Spam zahtjevi ({requests.length})</CardTitle>
          <p className="text-sm text-[#64748B]">Označeni kao spam</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Ime</th>
                  <th className="pb-3 pr-4">Telefon</th>
                  <th className="pb-3 pr-4">Grad</th>
                  <th className="pb-3 pr-4">Kategorija</th>
                  <th className="pb-3 pr-4">Naslov</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{r.requesterName ?? r.user?.name ?? "Guest"}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{r.requesterPhone ?? "-"}</td>
                    <td className="py-3 pr-4">{r.city}</td>
                    <td className="py-3 pr-4">{r.category}</td>
                    <td className="max-w-[180px] truncate py-3 pr-4">
                      {requestTitlePreview(r.title, r.description)}
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">
                      {new Date(r.createdAt).toLocaleDateString("sr")}
                    </td>
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
          {requests.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Nema spam zahtjeva</p>
          )}
        </CardContent>
      </Card>
    );
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    logAdminSsrFatal("[AdminModerationSSR]", "SpamList.findMany", { tab: "spam" }, err);
    return (
      <AdminRouteLoadError
        routeTitle="Moderation"
        cardTitle="Ne možemo učitati spam listu"
        logPrefix="[AdminModerationSSR]"
        message={e.message}
        code={prismaErrorCode(err)}
        snapshot={{ segment: "spam" }}
        resetHref="/admin/moderation?tab=spam"
      />
    );
  }
}
