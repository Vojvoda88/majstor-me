"use client";

import { useEffect, useState } from "react";
import { PremiumStatCard } from "@/components/ui/PremiumStatCard";

export function HomeStatsSection() {
  const [stats, setStats] = useState<{ handymanCount: number | null; completedJobsCount: number | null; avgRating: number | null; citiesCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const items = [
    {
      value: stats?.handymanCount != null && stats.handymanCount > 0 ? `${stats.handymanCount.toLocaleString("sr")}+` : "1.300+",
      label: "majstora",
    },
    {
      value: stats?.completedJobsCount != null && stats.completedJobsCount > 0 ? `${stats.completedJobsCount.toLocaleString("sr")}+` : "5.600+",
      label: "završenih poslova",
    },
    {
      value: stats?.avgRating != null ? `${stats.avgRating.toFixed(1)}` : "4.8",
      label: "prosječna ocjena",
    },
    {
      value: stats?.citiesCount != null && stats.citiesCount > 0 ? `${stats.citiesCount}+` : "20+",
      label: "gradova",
    },
  ];

  return (
    <section className="mt-[18px] md:mt-8">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {items.map(({ value, label }) => (
            <PremiumStatCard key={label} value={value} label={label} />
          ))}
        </div>
      </div>
    </section>
  );
}
