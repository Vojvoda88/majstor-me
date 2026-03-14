"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Wrench } from "lucide-react";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

function HandymanCard({
  id,
  name,
  city,
  categories,
  ratingAvg,
  reviewCount,
}: Handyman) {
  return (
    <Link
      href={`/handyman/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
    >
      <div className="flex h-24 items-center justify-center bg-slate-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Wrench className="h-8 w-8" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900">{name || "Majstor"}</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {categories[0] || "Majstor"} • {city || "Crna Gora"}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">
              {ratingAvg.toFixed(1)}
            </span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{reviewCount} recenzija</span>
        </div>
        <span className="mt-3 inline-flex w-full justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-700">
          Pogledaj profil
        </span>
      </div>
    </Link>
  );
}

export function TopMasters() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/handymen")
      .then((res) => res.json())
      .then((data) => {
        setHandymen(data.handymen || []);
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
          <HandymanCard key={u.id} {...u} />
        ))}
      </div>
    </section>
  );
}
