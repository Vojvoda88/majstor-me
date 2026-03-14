import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Na čekanju",
  ACCEPTED: "Prihvaćeno",
  REJECTED: "Odbijeno",
  WITHDRAWN: "Povučeno",
};

const PRICE_LABELS: Record<string, string> = {
  PO_DOGOVORU: "Po dogovoru",
  OKVIRNA: "Okvirna",
  IZLAZAK_NA_TEREN: "Izlazak na teren",
  FIKSNA: "Fiksna",
};

export default async function AdminOffersPage() {
  await requireAdminPermission("offers");
  const { prisma } = await import("@/lib/db");

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      handyman: { select: { id: true, name: true } },
      request: { select: { id: true, category: true, city: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Ponude</h1>
        <p className="mt-1 text-sm text-[#64748B]">Sve ponude majstora</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista ponuda ({offers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Majstor</th>
                  <th className="pb-3 pr-4">Zahtjev</th>
                  <th className="pb-3 pr-4">Cijena</th>
                  <th className="pb-3 pr-4">Procijenjeni dolazak</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/handymen/${o.handymanId}`} className="hover:underline">
                        {o.handyman.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/requests/${o.requestId}`} className="hover:underline">
                        {o.request.category} – {o.request.city}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      {PRICE_LABELS[o.priceType] ?? o.priceType}
                      {o.priceValue != null && ` ${o.priceValue}€`}
                    </td>
                    <td className="py-3 pr-4">{o.proposedArrival ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={
                          o.status === "ACCEPTED" ? "success" : o.status === "REJECTED" ? "destructive" : "secondary"
                        }
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">{new Date(o.createdAt).toLocaleDateString("sr")}</td>
                    <td className="py-3">
                      <Link href={`/admin/requests/${o.requestId}`} className="text-[#2563EB] hover:underline">
                        Zahtjev
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {offers.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema ponuda</p>}
        </CardContent>
      </Card>
    </div>
  );
}
