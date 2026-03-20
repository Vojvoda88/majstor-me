import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelEventType } from "@/lib/funnel-events";

export const dynamic = "force-dynamic";

const EVENT_ORDER: FunnelEventType[] = [
  "request_created",
  "lead_viewed_by_handyman",
  "unlock_clicked",
  "unlock_success",
  "insufficient_credits_seen",
  "credits_page_viewed",
  "credit_package_selected",
  "credit_purchase_started",
  "credit_purchase_success",
  "offer_sent_after_unlock",
];

const EVENT_LABELS: Record<FunnelEventType, string> = {
  request_created: "Zahtjev kreiran",
  lead_viewed_by_handyman: "Lead pregledan (majstor)",
  unlock_clicked: "Klik na otključaj",
  unlock_success: "Otključavanje uspjelo",
  insufficient_credits_seen: "Nedovoljno kredita (prikaz)",
  credits_page_viewed: "Stranica kredita",
  credit_package_selected: "Paket izabran",
  credit_purchase_started: "Kupovina započeta",
  credit_purchase_success: "Kupovina uspjela",
  offer_sent_after_unlock: "Ponuda poslata (nakon unlock)",
};

type Period = "today" | "7d" | "30d";

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return d;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 7);
  return d;
}

function pct(numerator: number, denominator: number): string {
  if (denominator <= 0) return "—";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

export default async function AdminFunnelPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdminPermission("credits");
  const params = await searchParams;
  const period: Period =
    params.period === "today" || params.period === "30d" ? params.period : "7d";
  const start = getPeriodStart(period);

  const { prisma } = await import("@/lib/db");

  const grouped = await prisma.funnelEvent.groupBy({
    by: ["event"],
    where: { createdAt: { gte: start } },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const g of grouped) {
    counts[g.event] = g._count._all;
  }

  const n = (key: FunnelEventType) => counts[key] ?? 0;

  const leadViews = n("lead_viewed_by_handyman");
  const unlockSuccess = n("unlock_success");
  const unlockClicked = n("unlock_clicked");
  const offersAfter = n("offer_sent_after_unlock");
  const creditsPage = n("credits_page_viewed");
  const purchaseStart = n("credit_purchase_started");
  const purchaseSuccess = n("credit_purchase_success");
  const insufficient = n("insufficient_credits_seen");

  const kpiRows = [
    {
      label: "Lead view → unlock (uspjeh)",
      value: pct(unlockSuccess, leadViews),
      detail: `${unlockSuccess} / ${leadViews}`,
    },
    {
      label: "Unlock → ponuda",
      value: pct(offersAfter, unlockSuccess),
      detail: `${offersAfter} / ${unlockSuccess}`,
    },
    {
      label: "Stranica kredita → start kupovine",
      value: pct(purchaseStart, creditsPage),
      detail: `${purchaseStart} / ${creditsPage}`,
    },
    {
      label: "Start kupovine → uspjeh",
      value: pct(purchaseSuccess, purchaseStart),
      detail: `${purchaseSuccess} / ${purchaseStart}`,
    },
    {
      label: "Nedovoljno kredita vs pregled leada",
      value: pct(insufficient, leadViews),
      detail: `${insufficient} / ${leadViews}`,
    },
  ];

  const periodLabel =
    period === "today" ? "Danas" : period === "30d" ? "30 dana" : "7 dana";

  const base = "/admin/funnel";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Funnel (monetizacija)</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Sažetak događaja iz baze — bez SQL-a. Period: {periodLabel}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["today", "Danas"],
            ["7d", "7 dana"],
            ["30d", "30 dana"],
          ] as const
        ).map(([p, label]) => (
          <Link
            key={p}
            href={`${base}?period=${p}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? "bg-[#2563EB] text-white"
                : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiRows.map((row) => (
          <Card key={row.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#64748B]">{row.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#0F172A]">{row.value}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{row.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Broj događaja</CardTitle>
          <CardDescription>Svi tipovi u izabranom periodu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-[#64748B]">
                  <th className="pb-2 pr-4 font-medium">Događaj</th>
                  <th className="pb-2 text-right font-medium">Broj</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_ORDER.map((ev) => (
                  <tr key={ev} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="py-2 pr-4 text-[#0F172A]">{EVENT_LABELS[ev]}</td>
                    <td className="py-2 text-right tabular-nums font-medium">{n(ev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
