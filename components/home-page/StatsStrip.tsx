"use client";

import { Users, Briefcase, Star, MapPin } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: "43",
    label: "REGISTROVANIH KORISNIKA",
    badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
  },
  {
    icon: Briefcase,
    value: "55",
    label: "AKTIVNIH MAJSTORA",
    badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
  },
  {
    icon: Star,
    value: "4.7",
    label: "PROSJEČNA OCJENA",
    badgeClass: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  },
  {
    icon: MapPin,
    value: "22",
    label: "GRADOVA U AKTIVNOSTI",
    badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
  },
] as const;

/** Premium proof bar odmah ispod hero — statički copy po specifikaciji */
export function StatsStrip() {
  return (
    /* pointer-events-none: strip vizuelno prelazi preko hero-a; bez ovoga klik „ispod“ ne dolazi do linka */
    <div className="relative z-20 mx-auto -mt-14 max-w-5xl px-4 pointer-events-none md:-mt-20">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100/70 p-px shadow-[0_12px_40px_-12px_rgba(10,22,40,0.12)] md:rounded-3xl">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[inherit] bg-slate-200/80 sm:grid-cols-2 md:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label, badgeClass }) => (
            <div
              key={label}
              className="flex items-center gap-4 bg-white px-5 py-5 md:flex-col md:items-center md:justify-center md:gap-3 md:px-4 md:py-6 lg:py-7"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl md:h-12 md:w-12 ${badgeClass}`}
              >
                <Icon className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0 text-left md:text-center">
                <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-brand-navy md:text-[1.75rem]">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-slate-500 md:text-[11px]">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
