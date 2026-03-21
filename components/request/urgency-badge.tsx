import { cn } from "@/lib/utils";
import { URGENCY_LABELS } from "@/lib/urgency-labels";

type Urgency = "HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO";

/**
 * Premium badge za hitnost — na listama i detalju zahtjeva.
 */
export function UrgencyBadge({
  urgency,
  className,
  size = "default",
}: {
  urgency: Urgency | string;
  className?: string;
  size?: "default" | "sm";
}) {
  const u = urgency as Urgency;
  const label = URGENCY_LABELS[u] ?? urgency;

  const isHot = u === "HITNO_DANAS";
  const isMid = u === "U_NAREDNA_2_DANA";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center whitespace-normal break-words text-center leading-snug ring-1 [word-break:break-word]",
        "rounded-full font-semibold tracking-tight",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        isHot &&
          "bg-gradient-to-r from-red-600/95 via-orange-600/95 to-amber-600/90 text-white shadow-[0_0_0_1px_rgba(254,215,170,0.35),0_6px_20px_-8px_rgba(220,38,38,0.55)] ring-red-500/30",
        isMid &&
          "bg-gradient-to-r from-amber-50 to-amber-100/95 text-amber-950 ring-amber-300/80 shadow-sm",
        !isHot &&
          !isMid &&
          "border border-slate-200/90 bg-slate-50/95 text-slate-700 ring-slate-200/60",
        className
      )}
    >
      {label}
    </span>
  );
}
