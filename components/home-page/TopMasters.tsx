"use client";

import { useEffect, useState } from "react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { Wrench } from "lucide-react";

export function TopMasters() {
  const [handymen, setHandymen] = useState<Array<{
    id: string;
    name: string | null;
    city: string | null;
    categories: string[];
    ratingAvg: number;
    reviewCount: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/handymen")
      .then((res) => res.json())
      .then((data) => {
        setHandymen(data.items ?? data.handymen ?? []);
      })
      .catch(() => setHandymen([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-10 lg:py-12">
        <h2 className="mb-6 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          Najbolje ocijenjeni majstori
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      </section>
    );
  }

  if (handymen.length === 0) {
    return (
      <section className="py-10 lg:py-12">
        <h2 className="mb-6 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          Najbolje ocijenjeni majstori
        </h2>
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Trenutno nema majstora. Postanite prvi!
        </p>
      </section>
    );
  }

  return (
    <section className="py-10 lg:py-12">
      <h2 className="mb-6 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        Najbolje ocijenjeni majstori
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {handymen.map((u) => (
          <HandymanCard key={u.id} {...u} variant="full" />
        ))}
      </div>
    </section>
  );
}
