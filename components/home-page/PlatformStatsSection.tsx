"use client";

import { useEffect, useState } from "react";

type PlatformStats = {
  handymanCount: number | null;
  completedJobsCount: number | null;
  avgRating: number | null;
  citiesCount: number;
};

export function PlatformStatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const items = [
    {
      value: stats?.handymanCount != null && stats.handymanCount > 0
        ? `${stats.handymanCount.toLocaleString("sr")}+`
        : "1.300+",
      label: "majstora",
    },
    {
      value: stats?.completedJobsCount != null && stats.completedJobsCount > 0
        ? `${stats.completedJobsCount.toLocaleString("sr")}+`
        : "5.600+",
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
            <div
              key={label}
              className="rounded-[18px] border border-[#E7EDF5] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
            >
              <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="mt-0.5 text-[13px] text-[#64748B]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
