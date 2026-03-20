import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestModerationActions } from "./request-moderation-actions";

export const dynamic = "force-dynamic";

function requestTitlePreview(title: string | null | undefined, description: string | null | undefined) {
  const s = (title ?? description ?? "").trim();
  if (!s) return "—";
  return s.length > 40 ? `${s.slice(0, 40)}…` : s;
}

export async function PendingRequestsList() {
  const { prisma } = await import("@/lib/db");

  const requests = await prisma.request.findMany({
    where: {
      OR: [{ adminStatus: "PENDING_REVIEW" }, { adminStatus: null }],
      deletedAt: null,
    },
    include: {
      user: { select: { name: true } },
      offers: { select: { id: true } },
    },
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
}
