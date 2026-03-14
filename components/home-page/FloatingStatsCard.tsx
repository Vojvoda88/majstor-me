"use client";

import { useEffect, useState } from "react";
import { Users, Wrench, Star, MapPin } from "lucide-react";

export function FloatingStatsCard() {
  const [stats, setStats] = useState<{
    handymanCount: number | null;
    completedJobsCount: number | null;
    avgRating: number | null;
    citiesCount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const items = [
    {
      icon: Users,
      value: "12.000+",
      label: "Korisnika",
    },
    {
      icon: Wrench,
      value: stats?.handymanCount != null && stats.handymanCount > 0 ? `${stats.handymanCount.toLocaleString("sr")}+` : "850+",
      label: "Majstora",
    },
    {
      icon: Star,
      value: stats?.avgRating != null ? `${stats.avgRating.toFixed(1)}` : "4.8",
      label: "Prosječna ocjena",
    },
    {
      icon: MapPin,
      value: stats?.citiesCount != null && stats.citiesCount > 0 ? `${stats.citiesCount}+` : "20+",
      label: "Gradova",
    },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4 md:-mt-12 md:px-6 lg:max-w-7xl lg:px-8">
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-md">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-2 flex h-10 w-10 items-center justify-center text-[#2563EB]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="mt-0.5 text-sm text-[#475569]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
