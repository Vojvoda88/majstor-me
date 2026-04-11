import { requireAdminPermission } from "@/lib/admin/auth";
import { PaymentsLiveRefresh } from "@/components/admin/payments-live-refresh";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isStripeCheckoutSessionId, stripeCheckoutSessionDashboardUrl } from "@/lib/stripe-dashboard-links";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  await requireAdminPermission("payments");
  const { prisma } = await import("@/lib/db");

  const stripePurchases = await prisma.creditTransaction.findMany({
    where: { type: "PURCHASE" },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      handyman: { select: { id: true, name: true, email: true } },
    },
  });

  const onlineRows = stripePurchases.filter((row) => isStripeCheckoutSessionId(row.referenceId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Plaćanja</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Online kupovine kredita (Stripe) kako su knjižene u sistemu. Izvor istine je webhook — podaci odgovaraju onome što je prošlo kroz BrziMajstor.
        </p>
      </div>

      <PaymentsLiveRefresh />

      <Card>
        <CardHeader>
          <CardTitle>Stripe — kupovine kredita</CardTitle>
          <CardDescription>
            Posljednjih {onlineRows.length} online transakcija (sesije koje počinju sa <code className="rounded bg-slate-100 px-1">cs_</code>). Sve
            transakcije kredita (uključujući druge tipove) i dalje su na stranici{" "}
            <Link href="/admin/credits" className="font-medium text-violet-700 underline-offset-2 hover:underline">
              Krediti
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onlineRows.length === 0 ? (
            <p className="py-8 text-center text-[#64748B]">Još nema online kupovina u bazi ili reference nisu Stripe sesije.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 pr-3">Datum</th>
                    <th className="pb-3 pr-3">Majstor</th>
                    <th className="pb-3 pr-3">Krediti</th>
                    <th className="pb-3 pr-3">Stanje nakon</th>
                    <th className="pb-3 pr-3">Napomena</th>
                    <th className="pb-3 pr-3">Stripe</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineRows.map((row) => {
                    const sid = row.referenceId!.trim();
                    const dashUrl = stripeCheckoutSessionDashboardUrl(sid);
                    return (
                      <tr key={row.id} className="border-b last:border-0 align-top">
                        <td className="py-3 pr-3 whitespace-nowrap text-[#64748B]">
                          {row.createdAt.toLocaleString("sr-Latn-ME", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="font-medium text-[#0F172A]">{row.handyman.name}</div>
                          <div className="text-xs text-[#64748B]">{row.handyman.email}</div>
                        </td>
                        <td className="py-3 pr-3 font-semibold tabular-nums text-emerald-800">+{row.amount}</td>
                        <td className="py-3 pr-3 tabular-nums text-[#475569]">{row.balanceAfter}</td>
                        <td className="py-3 pr-3 max-w-[220px] text-[#64748B]">{row.reason ?? "—"}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <a
                            href={dashUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-violet-700 underline-offset-2 hover:underline"
                          >
                            Otvori sesiju
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
