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
      <section className="py-16">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">
          Najbolje ocijenjeni majstori
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </section>
    );
  }

  if (handymen.length === 0) {
    return (
      <section className="py-16">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">
          Najbolje ocijenjeni majstori
        </h2>
        <p className="rounded-xl bg-white p-12 text-center text-gray-500 shadow-sm">
          Trenutno nema majstora. Postanite prvi!
        </p>
      </section>
    );
  }

  return (
    <section className="py-16">
      <h2 className="mb-6 text-3xl font-semibold text-gray-900">
        Najbolje ocijenjeni majstori
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {handymen.map((u) => (
          <HandymanCard key={u.id} {...u} variant="full" />
        ))}
      </div>
    </section>
  );
}
