"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, Star, MapPin } from "lucide-react";

type PlatformStats = {
  handymanCount: number | null;
  avgRating: number | null;
  citiesCount: number;
};

export function FloatingStatsCard({ initialStats = null }: { initialStats?: PlatformStats | null }) {
  const [clientStats, setClientStats] = useState<PlatformStats | null>(null);
  const stats = initialStats ?? clientStats;

  useEffect(() => {
    if (initialStats != null) return;
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then(setClientStats)
      .catch(() => setClientStats(null));
  }, [initialStats]);

  const items = [
    {
      icon: Users,
      className: "bg-blue-50 text-blue-600",
      value: "12,000+",
      label: "Korisnika",
    },
    {
      icon: Briefcase,
      className: "bg-indigo-50 text-indigo-600",
      value: stats?.handymanCount != null && stats.handymanCount > 0 ? `${stats.handymanCount.toLocaleString("sr")}+` : "850+",
      label: "Majstora",
    },
    {
      icon: Star,
      className: "bg-amber-50 text-amber-600",
      value: stats?.avgRating != null ? `${stats.avgRating.toFixed(1)}` : "4.8",
      label: "Prosječna ocjena",
    },
    {
      icon: MapPin,
      className: "bg-emerald-50 text-emerald-600",
      value: stats?.citiesCount != null && stats.citiesCount > 0 ? `${stats.citiesCount}+` : "20+",
      label: "Gradova",
    },
  ];

  return (
    <div className="relative z-20 mx-auto -mt-20 max-w-5xl px-4 md:-mt-24">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-premium-lg md:grid-cols-4">
        {items.map(({ icon: Icon, className, value, label }, idx) => (
          <div
            key={label}
            className={`flex items-center gap-5 ${idx < 3 ? "md:border-r md:border-slate-100 md:pr-8" : ""}`}
          >
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${className}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
