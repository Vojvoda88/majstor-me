import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDIT_PACKAGES } from "@/lib/credit-packages";
import Link from "next/link";

export const dynamic = "force-dynamic";

function priceEurForPurchaseCredits(credits: number): number | null {
  const pkg = CREDIT_PACKAGES.find((p) => p.credits === credits);
  return pkg ? pkg.priceEur : null;
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

  let sumEur = 0;
  let countedEurRows = 0;
  for (const p of purchases) {
    const eur = priceEurForPurchaseCredits(p.amount);
    if (eur != null) {
      sumEur += eur;
      countedEurRows += 1;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Plaćanja</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Online uplate karticom (Stripe Checkout). Ručne uplate (keš / Pošta) su na stranici{" "}
          <Link href="/admin/credits" className="text-blue-700 hover:underline">
            Krediti
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Online transakcije</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{purchases.length}</p>
            <p className="mt-1 text-xs text-[#64748B]">Tip „PURCHASE“ u bazi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procijenjen promet (EUR)</CardTitle>
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe uplate</CardTitle>
          <CardDescription>
            Svaka redovna online kupovina kredita kreira red ispod;{" "}
            <span className="font-mono text-xs">reference_id</span> je Stripe Checkout sesija (
            <span className="font-mono text-xs">cs_…</span>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 pr-3">Datum</th>
                  <th className="pb-3 pr-3">Majstor</th>
                  <th className="pb-3 pr-3">Kredita</th>
                  <th className="pb-3 pr-3">Iznos (€)</th>
                  <th className="pb-3 pr-3">Stanje nakon</th>
                  <th className="pb-3 pr-3">Stripe sesija</th>
                  <th className="pb-3 pr-3">Napomena</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((t) => {
                  const eur = priceEurForPurchaseCredits(t.amount);
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
    </div>
  );
}
