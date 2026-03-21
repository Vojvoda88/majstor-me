import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDIT_PACKAGES, getLeadsEstimate } from "@/lib/credit-packages";
import { LOW_CREDITS_THRESHOLD } from "@/lib/credits";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { isPaymentConfigured } from "@/lib/payment";
import { CreditsPurchaseButton } from "@/components/credits/credits-purchase-button";
import { CreditTransactionHistory } from "@/components/credits/credit-transaction-history";
import { HandymanCreditsCtaBlock } from "@/components/credits/handyman-credits-cta-block";

export const dynamic = "force-dynamic";

export default async function HandymanCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "HANDYMAN") redirect("/");

  const params = await searchParams;
  const { prisma } = await import("@/lib/db");
  const [profile, transactions] = await Promise.all([
    prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      select: { creditsBalance: true },
    }),
    prisma.creditTransaction.findMany({
      where: { handymanId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        type: true,
        referenceId: true,
        reason: true,
        createdAt: true,
      },
    }),
  ]);
  const balance = (profile as { creditsBalance?: number } | null)?.creditsBalance ?? 0;

  void trackFunnelEvent(prisma, "credits_page_viewed", undefined, session.user.id);
  if (params.success === "1") {
    void trackFunnelEvent(prisma, "credit_purchase_success", undefined, session.user.id);
  }

  const paymentOnline = isPaymentConfigured();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/handyman" className="text-sm text-slate-500 hover:text-slate-700">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Krediti — kako dopuniti</h1>
      <p className="mt-2 text-slate-600">
        Krediti se troše tek kada uzmete kontakt korisnika (obično 20–60, zavisi od hitnosti, slika, detalja i potvrđenog
        kontakta). Ispod birate: <strong className="font-semibold text-slate-800">online kupovinu</strong> ili{" "}
        <strong className="font-semibold text-slate-800">aktivaciju u kešu</strong> — oba puta znate šta slijedi.
      </p>

      <div className="mt-6">
        <HandymanCreditsCtaBlock paymentOnline={paymentOnline} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Šta se dešava poslije</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="font-semibold text-slate-900">Online:</strong> platite karticom — krediti se dodaju nakon
            uspješne uplate (kad je plaćanje uključeno).
          </li>
          <li>
            <strong className="font-semibold text-slate-900">Keš / Pošta:</strong> popunite formu — javljamo se oko uplate;
            krediti stižu na nalog nakon što uplata bude potvrđena.
          </li>
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Trenutni balans</p>
        <p className="text-2xl font-bold text-slate-900">{balance} kredita</p>
        {balance > 0 && balance < LOW_CREDITS_THRESHOLD && (
          <p className="mt-1 text-xs font-medium text-amber-600">Preostalo vam je još {balance} kredita.</p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Kratko o plaćanju i povratu</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Pregled posla je besplatan — krediti se skidaju tek kad potvrdite da želite kontakt.</li>
          <li>
            Povrat kredita postoji ako admin označi zahtjev kao spam ili pokušaj zaobilaženja, ili zbog tehničke greške.
            Ako se korisnik ne javi, krediti se ne vraćaju automatski.
          </li>
        </ul>
      </div>

      {paymentOnline ? (
        <section id="online-paketi" className="scroll-mt-24">
          <h2 className="mt-10 text-lg font-bold text-slate-900">Kupovina online</h2>
          <p className="mt-2 text-sm text-slate-600">
            Platite karticom — krediti se dodaju na račun nakon uspješne uplate.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className={pkg.popular ? "border-blue-500 ring-1 ring-blue-200" : ""}>
                <CardHeader className="pb-2">
                  {pkg.popular && (
                    <span className="mb-2 inline-block w-fit rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Popularno
                    </span>
                  )}
                  <CardTitle>{pkg.label}</CardTitle>
                  <CardDescription>
                    {pkg.priceEur.toFixed(2)} € {pkg.perCredit && ` · ${pkg.perCredit}`}
                  </CardDescription>
                  <p className="mt-1 text-xs text-slate-500">
                    {(() => {
                      const n = getLeadsEstimate(pkg.credits);
                      return n === 1 ? "Oko 1 kontakta po uobičajenoj cijeni" : `Oko ${n} kontakata po uobičajenoj cijeni`;
                    })()}
                  </p>
                </CardHeader>
                <CardContent>
                  <CreditsPurchaseButton pkg={pkg} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <section id="online-info" className="scroll-mt-24">
          <h2 className="mt-10 text-lg font-bold text-slate-900">Kupovina karticom na sajtu</h2>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            <p className="leading-relaxed">
              Uskoro će ovdje biti omogućena kupovina karticom. Do tada kredite možete dopuniti preko dugmeta{" "}
              <strong className="font-semibold text-slate-900">Aktivacija u kešu</strong> — to je podržan i uobičajen
              način.
            </p>
          </div>
        </section>
      )}

      <section className="mt-10 scroll-mt-24 rounded-2xl border-2 border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm md:p-6">
        <h2 className="font-display text-lg font-bold text-slate-900 md:text-xl">Aktivacija u kešu ili preko Pošte</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Jedan klik otvara formu: unesete podatke, birate paket i šaljete zahtjev. Javljamo se oko uplate; krediti se
          dodaju nakon potvrde.
        </p>
        <Link
          href="/dashboard/handyman/credits/aktivacija-kes"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Otvori formu — aktivacija u kešu
        </Link>
      </section>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Istorija transakcija</CardTitle>
          <CardDescription>Pregled potrošnje, kupovine i povrata kredita</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditTransactionHistory transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
