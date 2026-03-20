import type { CreditBreakdown } from "@/lib/lead-tier";

export function LeadPriceBreakdown({ breakdown }: { breakdown: CreditBreakdown }) {
  const hasItems = breakdown.items.length > 0;

  return (
    <div className="mt-2 rounded border border-slate-200/80 bg-white/80 px-3 py-2 text-xs text-slate-600">
      <div className="flex items-baseline justify-between gap-4">
        <span>Osnovna cijena ({breakdown.baseLabel}):</span>
        <span className="font-medium tabular-nums">{breakdown.base}</span>
      </div>
      {hasItems && (
        <>
          {breakdown.items.map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="text-slate-500">{item.label}:</span>
              <span className="font-medium tabular-nums text-emerald-600">
                +{item.amount}
              </span>
            </div>
          ))}
        </>
      )}
      <div className="mt-1.5 flex items-baseline justify-between gap-4 border-t border-slate-200/80 pt-1.5 font-semibold text-slate-800">
        <span>Ukupno:</span>
        <span className="tabular-nums">{breakdown.total} kredita</span>
      </div>
    </div>
  );
}
