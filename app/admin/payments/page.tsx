import { requireAdminPermission } from "@/lib/admin/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDIT_PACKAGES, getPackageById } from "@/lib/credit-packages";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: "Kartica / Stripe",
  kes: "Keš",
  posta: "Pošta Crne Gore",
};

function packageForPurchaseCredits(credits: number) {
  return CREDIT_PACKAGES.find((p) => p.credits === credits) ?? null;
}

function priceEurForPurchaseCredits(credits: number): number | null {
  return packageForPurchaseCredits(credits)?.priceEur ?? null;
}

export default async function AdminPaymentsPage() {
  await requireAdminPermission("payments");
  const { prisma } = await import("@/lib/db");

  const purchases = await prisma.creditTransaction.findMany({
    where: { type: "PURCHASE" },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      handyman: { select: { id: true, name: true, email: true } },
    },
  });

  const manualRequests = await prisma.creditCashActivationRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  let sumEur = 0;
  let countedEurRows = 0;
  for (const p of purchases) {
    const eur = priceEurForPurchaseCredits(p.amount);
    if (eur != null) {
      sumEur += eur;
      countedEurRows += 1;
    }
  }

  let manualSumEur = 0;
  for (const row of manualRequests) {
    const pkg = getPackageById(row.packageId);
    if (pkg) manualSumEur += pkg.priceEur;
  }

  const purchaseSummaryByHandyman = Array.from(
    purchases.reduce(
      (acc, tx) => {
        const existing = acc.get(tx.handymanId) ?? {
          handymanId: tx.handymanId,
          name: tx.handyman.name,
          email: tx.handyman.email,
          totalCredits: 0,
          totalEur: 0,
          purchasesCount: 0,
          lastPurchaseAt: tx.createdAt,
        };
        existing.totalCredits += tx.amount;
        existing.totalEur += priceEurForPurchaseCredits(tx.amount) ?? 0;
        existing.purchasesCount += 1;
        if (tx.createdAt > existing.lastPurchaseAt) existing.lastPurchaseAt = tx.createdAt;
        acc.set(tx.handymanId, existing);
        return acc;
      },
      new Map<
        string,
        {
          handymanId: string;
          name: string;
          email: string;
          totalCredits: number;
          totalEur: number;
          purchasesCount: number;
          lastPurchaseAt: Date;
        }
      >()
    ).values()
  ).sort((a, b) => b.totalEur - a.totalEur || b.totalCredits - a.totalCredits);

  const uniqueOnlinePayers = new Set(purchases.map((p) => p.handymanId)).size;
  const uniqueManualPayers = new Set(manualRequests.map((r) => r.userId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Plaćanja</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Pregled uplata po majstoru, metodi plaćanja i pojedinačnim transakcijama.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Online transakcije</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{purchases.length}</p>
            <p className="mt-1 text-xs text-[#64748B]">Stripe / kartica ({uniqueOnlinePayers} majstora)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Online promet (EUR)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {countedEurRows === purchases.length
                ? `${sumEur.toFixed(2)} €`
                : `${sumEur.toFixed(2)} € *`}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">
              {countedEurRows < purchases.length && purchases.length > 0
                ? `Zbir samo za poznate pakete (${countedEurRows}/${purchases.length}).`
                : "Po cijenama paketa iz kataloga."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ručni zahtjevi za uplatu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{manualRequests.length}</p>
            <p className="mt-1 text-xs text-[#64748B]">Keš / Pošta ({uniqueManualPayers} majstora)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vrijednost ručnih zahtjeva</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{manualSumEur.toFixed(2)} €</p>
            <p className="mt-1 text-xs text-[#64748B]">Po odabranim paketima u zahtjevima</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ko je koliko uplatio</CardTitle>
          <CardDescription>
            Zbir online uplata po majstoru. Ovo je najbrži pregled ko je platio najviše i koliko puta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-3">Majstor</th>
                  <th className="pb-3 pr-3">Broj uplata</th>
                  <th className="pb-3 pr-3">Ukupno kredita</th>
                  <th className="pb-3 pr-3">Ukupno (€)</th>
                  <th className="pb-3 pr-3">Zadnja uplata</th>
                </tr>
              </thead>
              <tbody>
                {purchaseSummaryByHandyman.map((row) => (
                  <tr key={row.handymanId} className="border-b last:border-0 align-top">
                    <td className="py-3 pr-3">
                      <Link href={`/admin/handymen/${row.handymanId}`} className="font-medium hover:underline">
                        {row.name}
                      </Link>
                      <div className="text-xs text-[#64748B]">{row.email}</div>
                    </td>
                    <td className="py-3 pr-3">{row.purchasesCount}</td>
                    <td className="py-3 pr-3 font-medium text-green-700">{row.totalCredits}</td>
                    <td className="py-3 pr-3 font-medium">{row.totalEur.toFixed(2)} €</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-[#64748B]">
                      {new Date(row.lastPurchaseAt).toLocaleString("sr")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {purchaseSummaryByHandyman.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Još nema online uplata za prikaz po majstoru.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pojedinačne online uplate</CardTitle>
          <CardDescription>
            Svaka redovna online kupovina kredita kreira jedan red. Ovdje vidiš ko je uplatio, koliko i preko čega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-3">Datum</th>
                  <th className="pb-3 pr-3">Majstor</th>
                  <th className="pb-3 pr-3">Način</th>
                  <th className="pb-3 pr-3">Paket</th>
                  <th className="pb-3 pr-3">Kredita</th>
                  <th className="pb-3 pr-3">Iznos (€)</th>
                  <th className="pb-3 pr-3">Stanje nakon</th>
                  <th className="pb-3 pr-3">Stripe sesija</th>
                  <th className="pb-3 pr-3">Napomena</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((t) => {
                  const pkg = packageForPurchaseCredits(t.amount);
                  const eur = pkg?.priceEur ?? null;
                  const sessionId = t.referenceId ?? "";
                  const stripeSearch =
                    sessionId.length > 0
                      ? `https://dashboard.stripe.com/search?query=${encodeURIComponent(sessionId)}`
                      : null;
                  return (
                    <tr key={t.id} className="border-b last:border-0 align-top">
                      <td className="py-3 pr-3 whitespace-nowrap text-[#64748B]">
                        {new Date(t.createdAt).toLocaleString("sr")}
                      </td>
                      <td className="py-3 pr-3">
                        <Link href={`/admin/handymen/${t.handymanId}`} className="font-medium hover:underline">
                          {t.handyman.name}
                        </Link>
                        <div className="text-xs text-[#64748B]">{t.handyman.email}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant="outline">{PAYMENT_METHOD_LABELS.stripe}</Badge>
                      </td>
                      <td className="py-3 pr-3">{pkg?.label ?? "—"}</td>
                      <td className="py-3 pr-3 font-medium text-green-700">+{t.amount}</td>
                      <td className="py-3 pr-3">{eur != null ? `${eur.toFixed(2)} €` : "—"}</td>
                      <td className="py-3 pr-3">{t.balanceAfter}</td>
                      <td className="py-3 pr-3">
                        {stripeSearch ? (
                          <a
                            href={stripeSearch}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-700 hover:underline break-all"
                          >
                            {sessionId}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-3 max-w-[220px] text-xs text-[#475569]">{t.reason ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {purchases.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">
              Još nema online uplata. Kad majstor plati paket preko Stripea, pojaviće se ovdje.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ručni zahtjevi za uplatu</CardTitle>
          <CardDescription>
            Keš / Pošta zahtjevi. Ovo nisu Stripe transakcije nego prijave majstora za ručnu aktivaciju kredita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-3">Datum</th>
                  <th className="pb-3 pr-3">Majstor</th>
                  <th className="pb-3 pr-3">Način</th>
                  <th className="pb-3 pr-3">Paket</th>
                  <th className="pb-3 pr-3">Vrijednost (€)</th>
                  <th className="pb-3 pr-3">Status</th>
                  <th className="pb-3 pr-3">Telefon</th>
                </tr>
              </thead>
              <tbody>
                {manualRequests.map((row) => {
                  const pkg = getPackageById(row.packageId);
                  return (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      <td className="py-3 pr-3 whitespace-nowrap text-[#64748B]">
                        {new Date(row.createdAt).toLocaleString("sr")}
                      </td>
                      <td className="py-3 pr-3">
                        <Link href={`/admin/handymen/${row.userId}`} className="font-medium hover:underline">
                          {row.user.name}
                        </Link>
                        <div className="text-xs text-[#64748B]">{row.user.email}</div>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant="outline">
                          {row.paymentMethod ? PAYMENT_METHOD_LABELS[row.paymentMethod] ?? row.paymentMethod : "—"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">{pkg?.label ?? row.packageId}</td>
                      <td className="py-3 pr-3">{pkg ? `${pkg.priceEur.toFixed(2)} €` : "—"}</td>
                      <td className="py-3 pr-3">
                        <Badge
                          variant={
                            row.status === "COMPLETED"
                              ? "success"
                              : row.status === "REJECTED"
                                ? "destructive"
                                : "warning"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap font-mono text-xs">{row.phone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {manualRequests.length === 0 && (
            <p className="py-8 text-center text-[#64748B]">Još nema ručnih zahtjeva za uplatu.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
