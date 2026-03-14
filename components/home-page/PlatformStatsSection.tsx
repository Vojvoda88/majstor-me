"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, Star, MapPin } from "lucide-react";

type PlatformStats = {
  handymanCount: number | null;
  completedJobsCount: number | null;
  avgRating: number | null;
  reviewCount: number | null;
  citiesCount: number;
  categoriesCount: number;
  requestCount: number | null;
};

export function PlatformStatsSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/platform")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const hasRealData =
    (stats.handymanCount != null && stats.handymanCount > 0) ||
    (stats.completedJobsCount != null && stats.completedJobsCount > 0) ||
    (stats.avgRating != null && stats.reviewCount != null && stats.reviewCount > 0);

  if (!hasRealData) return null;

  const items: { icon: typeof Users; label: string; value: string | number }[] = [];

  if (stats.handymanCount != null && stats.handymanCount > 0) {
    items.push({
      icon: Users,
      label: "Majstora",
      value: stats.handymanCount,
    });
  }
  if (stats.completedJobsCount != null && stats.completedJobsCount > 0) {
    items.push({
      icon: Briefcase,
      label: "Završenih poslova",
      value: stats.completedJobsCount,
    });
  }
  if (stats.avgRating != null && stats.reviewCount != null && stats.reviewCount > 0) {
    items.push({
      icon: Star,
      label: "Prosječna ocjena",
      value: `${stats.avgRating.toFixed(1)} ★`,
    });
  }
  if (stats.citiesCount > 0 || stats.categoriesCount > 0) {
    items.push({
      icon: MapPin,
      label: "Gradova / Kategorija",
      value: `${stats.citiesCount} / ${stats.categoriesCount}`,
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="py-8 lg:py-10">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-lg font-bold text-slate-900">
          Majstor.me u brojevima
        </h2>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
