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
    <section className="py-10 sm:py-14 lg:py-16">
      <h2 className="mb-4 text-center text-2xl font-semibold text-gray-900 sm:mb-6 sm:text-3xl">
        Majstor.me u brojevima
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-5 text-center shadow-sm transition hover:shadow-md sm:p-6"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 sm:mb-3 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            </div>
            <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
            <p className="mt-0.5 text-xs text-gray-600 sm:mt-1 sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
