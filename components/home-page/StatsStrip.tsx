"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  Star,
  MapPin,
  ClipboardList,
  MapPinned,
  BadgeCheck,
  CheckCircle2,
} from "lucide-react";

type PlatformStats = {
  userCount: number | null;
  handymanCount: number | null;
  completedJobsCount: number | null;
  avgRating: number | null;
  reviewCount: number | null;
  citiesCount: number;
};

type NumberStat = {
  kind: "number";
  icon: typeof Users;
  value: string;
  label: string;
  badgeClass: string;
};

type TrustStat = {
  kind: "trust";
  icon: typeof ClipboardList;
  title: string;
  description: string;
  badgeClass: string;
};

/** Kad nema dovoljno stvarnih brojki — kratki trust signal, bez dupliranja hero copy-ja */
const TRUST_FALLBACK: TrustStat[] = [
  {
    kind: "trust",
    icon: ClipboardList,
    title: "Jasna objava",
    description: "Opišite posao jednom — majstori vide šta tražite.",
    badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
  },
  {
    kind: "trust",
    icon: MapPinned,
    title: "Lokalno",
    description: "Povezivanje s majstorima iz grada i okoline.",
    badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
  },
  {
    kind: "trust",
    icon: BadgeCheck,
    title: "Pregledno",
    description: "Ponude i ocjene prije odluke, u svom ritmu.",
    badgeClass: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  },
];

function buildNumberStats(data: PlatformStats): NumberStat[] {
  const candidates: NumberStat[] = [];

  if (data.handymanCount != null && data.handymanCount > 0) {
    candidates.push({
      kind: "number",
      icon: Briefcase,
      value: data.handymanCount.toLocaleString("sr-Latn"),
      label: "majstora na platformi",
      badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
    });
  }

  if (data.completedJobsCount != null && data.completedJobsCount > 0) {
    candidates.push({
      kind: "number",
      icon: CheckCircle2,
      value: data.completedJobsCount.toLocaleString("sr-Latn"),
      label: "završenih poslova",
      badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
    });
  }

  if (data.avgRating != null && data.reviewCount != null && data.reviewCount > 0) {
    candidates.push({
      kind: "number",
      icon: Star,
      value: data.avgRating.toLocaleString("sr-Latn", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      label: "prosječna ocjena (recenzije)",
      badgeClass: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
    });
  }

  if (data.citiesCount > 0) {
    candidates.push({
      kind: "number",
      icon: MapPin,
      value: data.citiesCount.toLocaleString("sr-Latn"),
      label: "gradova u aktivnosti",
      badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
    });
  }

  if (data.userCount != null && data.userCount > 0) {
    candidates.push({
      kind: "number",
      icon: Users,
      value: data.userCount.toLocaleString("sr-Latn"),
      label: "registrovanih korisnika",
      badgeClass: "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80",
    });
  }

  return candidates.slice(0, 4);
}

function gridClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  return "grid-cols-1 gap-px overflow-hidden rounded-[inherit] bg-slate-200/80 sm:grid-cols-2 md:grid-cols-4";
}

/**
 * Ispod hero-a: stvarne brojke iz /api/stats/platform kada postoje,
 * inače kratki trust signali bez izmišljenih metrika.
 */
export function StatsStrip() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then((json: PlatformStats) => {
        if (!cancelled) setStats(json);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const numberStats = stats ? buildNumberStats(stats) : [];
  const useNumbers = numberStats.length > 0;
  const items: (NumberStat | TrustStat)[] = useNumbers ? numberStats : TRUST_FALLBACK;
  const cols = gridClass(items.length);

  return (
    <section className="py-5 md:py-7" aria-labelledby="stats-trust-title">
      <div className="mb-3 flex items-center justify-between px-1 md:mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Pokazatelji pouzdanosti</p>
          <h3 id="stats-trust-title" className="mt-1 font-display text-lg font-bold tracking-tight text-slate-900 md:text-xl">
            Platforma u brojkama
          </h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-px shadow-[0_16px_42px_-30px_rgba(15,23,42,0.36)] backdrop-blur-sm md:rounded-3xl">
        {loading ? (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[inherit] bg-slate-200/80 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex min-h-[86px] items-center justify-center bg-white px-5 py-4 md:min-h-[96px] md:py-5"
              >
                <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200/90 md:h-12 md:w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-px overflow-hidden rounded-[inherit] bg-slate-200/80 ${cols}`}>
            {items.map((item) => {
              const Icon = item.icon;
              if (item.kind === "number") {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-white px-4 py-3.5 md:flex-col md:items-center md:justify-center md:gap-2.5 md:px-4 md:py-5"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-11 md:w-11 ${item.badgeClass}`}
                    >
                      <Icon className="h-4.5 w-4.5 md:h-5 md:w-5" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="min-w-0 text-left md:text-center">
                      <p className="font-display text-[1.4rem] font-bold tabular-nums tracking-tight text-brand-navy md:text-[1.6rem]">
                        {item.value}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase leading-snug tracking-[0.08em] text-slate-500 md:text-[11px]">
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 bg-white px-4 py-3.5 md:flex-col md:items-center md:justify-center md:gap-2.5 md:px-4 md:py-5"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-11 md:w-11 ${item.badgeClass}`}
                  >
                    <Icon className="h-4.5 w-4.5 md:h-5 md:w-5" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0 text-left md:text-center">
                    <p className="font-display text-[15px] font-bold tracking-tight text-brand-navy md:text-lg">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-600 md:text-[13px]">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
