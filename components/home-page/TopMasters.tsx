"use client";

import { useEffect, useState } from "react";
import { PremiumHandymanCard } from "@/components/lists/PremiumHandymanCard";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  verifiedStatus?: string;
  completedJobsCount?: number;
  averageResponseMinutes?: number | null;
};

export function TopMasters() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);

  useEffect(() => {
    fetch("/api/handymen?limit=2&sort=rating")
      .then((res) => res.json())
      .then((data) => setHandymen(data.items ?? data.handymen ?? []))
      .catch(() => {});
  }, []);

  if (handymen.length === 0) return null;

  return (
    <section className="mt-7 md:mt-10">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <h2 className="mb-4 text-xl font-bold text-[#0F172A]">Najbolje ocijenjeni</h2>
        <div className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {handymen.slice(0, 2).map((h) => (
            <PremiumHandymanCard key={h.id} {...h} />
          ))}
        </div>
      </div>
    </section>
  );
}
