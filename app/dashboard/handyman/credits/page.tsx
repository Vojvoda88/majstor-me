import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKAGES, getLeadsEstimate } from "@/lib/credit-packages";
import { LOW_CREDITS_THRESHOLD } from "@/lib/credits";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { isPaymentConfigured } from "@/lib/payment";
import { CreditsPurchaseButton } from "@/components/credits/credits-purchase-button";
import { CreditTransactionHistory } from "@/components/credits/credit-transaction-history";

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

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/handyman" className="text-sm text-slate-500 hover:text-slate-700">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Kupovina kredita
      </h1>
      <p className="mt-2 text-slate-600">
        Otključavanje leada troši 20–60 kredita zavisno od kvaliteta zahtjeva. Kupite paket koji vam odgovara.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Trenutni balans</p>
        <p className="text-2xl font-bold text-slate-900">{balance} kredita</p>
        {balance > 0 && balance < LOW_CREDITS_THRESHOLD && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Preostalo vam je još {balance} kredita.
          </p>
        )}
      </div>

      {isPaymentConfigured() ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
                    return n === 1 ? "Oko 1 standardnog leada" : `Oko ${n} standardnih leadova`;
                  })()}
                </p>
              </CardHeader>
              <CardContent>
                <CreditsPurchaseButton pkg={pkg} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Istorija transakcija</CardTitle>
          <CardDescription>
            Pregled potrošnje, kupovine i refundova kredita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreditTransactionHistory transactions={transactions} />
        </CardContent>
      </Card>

      {!isPaymentConfigured() && (
        <Card className="mt-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle>Plaćanje uskoro dostupno</CardTitle>
            <CardDescription>
              Kupovina kredita putem kartice biće omogućena uskoro. Administrator će vas obavijestiti kada bude spremno.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/handyman">
              <Button variant="outline">Nazad na dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
