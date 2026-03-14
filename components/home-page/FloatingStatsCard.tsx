"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, Star, MapPin } from "lucide-react";

export function FloatingStatsCard() {
  const [stats, setStats] = useState<{
    handymanCount: number | null;
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
      iconColor: "text-[#2563EB]",
      value: "12,000+",
      label: "Korisnika",
    },
    {
      icon: Briefcase,
      iconColor: "text-blue-500",
      value: stats?.handymanCount != null && stats.handymanCount > 0 ? `${stats.handymanCount.toLocaleString("sr")}+` : "850+",
      label: "Majstora",
    },
    {
      icon: Star,
      iconColor: "text-amber-500",
      value: stats?.avgRating != null ? `${stats.avgRating.toFixed(1)}` : "4.8",
      label: "Prosječna ocjena",
    },
    {
      icon: MapPin,
      iconColor: "text-blue-700",
      value: stats?.citiesCount != null && stats.citiesCount > 0 ? `${stats.citiesCount}+` : "20+",
      label: "Gradova",
    },
  ];

  return (
    <div className="relative z-20 mx-auto -mt-12 max-w-5xl px-4">
      <div className="grid grid-cols-2 gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg md:grid-cols-4">
        {items.map(({ icon: Icon, iconColor, value, label }, idx) => (
          <div
            key={label}
            className={`flex items-center gap-4 ${idx < 3 ? "md:border-r md:border-gray-100 md:pr-4" : ""}`}
          >
            <div className={`text-2xl ${iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold leading-tight text-gray-900">{value}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
