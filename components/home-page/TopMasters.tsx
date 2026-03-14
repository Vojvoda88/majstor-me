"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { HERO_IMAGE } from "@/lib/homepage-data";

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
          {handymen.slice(0, 2).map((h) => {
            const isVerified = h.verifiedStatus === "VERIFIED";
            const imgSrc = h.avatarUrl ?? HERO_IMAGE;
            return (
              <div
                key={h.id}
                className="overflow-hidden rounded-[22px] border border-[#E7EDF5] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="relative h-40 w-full">
                  <Image src={imgSrc} alt="" fill className="object-cover" sizes="430px" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-semibold text-[#0F172A]">{h.name || "Majstor"}</h3>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-800">
                      ⭐ {h.ratingAvg.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-[#475569]">
                    {h.categories[0] || "Majstor"} • {h.city || "Crna Gora"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
                      </span>
                    )}
                    {h.averageResponseMinutes != null && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                        ~{h.averageResponseMinutes} min
                      </span>
                    )}
                    {h.completedJobsCount != null && h.completedJobsCount > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {h.completedJobsCount} poslova
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/handyman/${h.id}`}
                    className="mt-3 flex h-[46px] w-full items-center justify-center rounded-[12px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition active:scale-[0.98]"
                  >
                    Pogledaj profil
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
