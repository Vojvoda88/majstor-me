import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function SpamList() {
  const { prisma } = await import("@/lib/db");

  const requests = await prisma.request.findMany({
    where: { adminStatus: "SPAM" },
    include: { user: { select: { name: true } } },
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
                    {r.title ?? r.description.slice(0, 40)}…
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
}
