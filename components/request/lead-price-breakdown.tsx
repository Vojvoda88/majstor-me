import type { CreditBreakdown } from "@/lib/lead-tier";

export function LeadPriceBreakdown({ breakdown }: { breakdown: CreditBreakdown }) {
  const hasItems = breakdown.items.length > 0;

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-slate-600">Osnovna cijena ({breakdown.baseLabel}):</span>
        <span className="font-semibold tabular-nums text-brand-navy">{breakdown.base}</span>
      </div>
      {hasItems && (
        <>
          {breakdown.items.map((item) => (
            <div key={item.label} className="mt-1.5 flex items-baseline justify-between gap-4">
              <span className="text-slate-500">{item.label}:</span>
              <span className="font-medium tabular-nums text-emerald-600">+{item.amount}</span>
            </div>
          ))}
        </>
      )}
      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-slate-200/80 pt-3 font-bold text-brand-navy">
        <span>Ukupno:</span>
        <span className="tabular-nums text-lg">{breakdown.total} kredita</span>
      </div>
    </div>
  );
}
