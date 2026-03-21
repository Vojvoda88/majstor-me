import { requireAdminPermission } from "@/lib/admin/auth";
import { CashActivationStatusCell } from "@/components/admin/cash-activation-status-cell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPackageById } from "@/lib/credit-packages";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  kes: "Keš",
  posta: "Pošta Crne Gore",
};

const TYPE_LABELS: Record<string, string> = {
  PURCHASE: "Kupovina",
  ADMIN_ADD: "Admin dodatak",
  ADMIN_REMOVE: "Admin oduzimanje",
  REFUND: "Refund",
  UNLOCK_CONTACT: "Otključaj kontakta",
  CONTACT_UNLOCK: "Otključaj kontakta",
  PROMO_BONUS: "Promo bonus",
  CORRECTION: "Korekcija",
  OFFER_SENT: "Ponuda poslata",
  BONUS: "Bonus",
};

export default async function AdminCreditsPage() {
  await requireAdminPermission("credits");
  const { prisma } = await import("@/lib/db");

  const transactions = await prisma.creditTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      handyman: { select: { id: true, name: true } },
    },
  });

  const handymenWithCredits = await prisma.handymanProfile.findMany({
    select: { userId: true, creditsBalance: true },
  });

  const totalCreditsInCirculation = handymenWithCredits.reduce((s, h) => s + h.creditsBalance, 0);

  const cashActivations = await prisma.creditCashActivationRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Krediti</h1>
        <p className="mt-1 text-sm text-[#64748B]">Upravljanje kreditima majstora</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ukupno kredita u opticaju</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCreditsInCirculation}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zahtjevi za aktivaciju u kešu / Pošti</CardTitle>
          <CardDescription>
            Ručna obrada — kontakt na telefon iz forme; nalog majstora u sistemu (email za vezu sa nalogom). Posljednjih{" "}
            {cashActivations.length} zapisa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-3">Datum</th>
                  <th className="pb-3 pr-3">Status</th>
                  <th className="pb-3 pr-3">Ime</th>
                  <th className="pb-3 pr-3">Telefon</th>
                  <th className="pb-3 pr-3">Grad</th>
                  <th className="pb-3 pr-3">Paket</th>
                  <th className="pb-3 pr-3">Način</th>
                  <th className="pb-3 pr-3">Nalog</th>
                  <th className="pb-3 pr-3">Napomena</th>
                </tr>
              </thead>
              <tbody>
                {cashActivations.map((row) => {
                  const pkg = getPackageById(row.packageId);
                  return (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      <td className="py-3 pr-3 whitespace-nowrap text-[#64748B]">
                        {new Date(row.createdAt).toLocaleString("sr")}
                      </td>
                      <td className="py-3 pr-3">
                        <CashActivationStatusCell requestId={row.id} initialStatus={row.status} />
                      </td>
                      <td className="py-3 pr-3 max-w-[140px]">{row.fullName}</td>
                      <td className="py-3 pr-3 whitespace-nowrap font-mono text-xs">{row.phone}</td>
                      <td className="py-3 pr-3">{row.city}</td>
                      <td className="py-3 pr-3">{pkg ? `${pkg.label} (${pkg.priceEur.toFixed(2)} €)` : row.packageId}</td>
                      <td className="py-3 pr-3">
                        {row.paymentMethod ? PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod : "—"}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-col gap-0.5">
                          <Link href={`/admin/handymen/${row.userId}`} className="text-blue-700 hover:underline">
                            {row.user.name}
                          </Link>
                          <span className="text-xs text-[#64748B]">{row.user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 max-w-[200px] text-xs text-[#475569]">{row.note ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {cashActivations.length === 0 && (
            <p className="py-6 text-center text-[#64748B]">Još nema zahtjeva za keš aktivaciju.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Istorija transakcija ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-4">Datum</th>
                  <th className="pb-3 pr-4">Majstor</th>
                  <th className="pb-3 pr-4">Tip</th>
                  <th className="pb-3 pr-4">Iznos</th>
                  <th className="pb-3 pr-4">Stanje nakon</th>
                  <th className="pb-3 pr-4">Referenca</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 text-[#64748B]">{new Date(t.createdAt).toLocaleString("sr")}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/handymen/${t.handymanId}`} className="hover:underline">
                        {t.handyman.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{TYPE_LABELS[t.type] ?? t.type}</td>
                    <td className={`py-3 pr-4 font-medium ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {t.amount >= 0 ? "+" : ""}{t.amount}
                    </td>
                    <td className="py-3 pr-4">{t.balanceAfter}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{t.referenceId?.slice(0, 8) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {transactions.length === 0 && <p className="py-8 text-center text-[#64748B]">Nema transakcija</p>}
        </CardContent>
      </Card>
    </div>
  );
}
