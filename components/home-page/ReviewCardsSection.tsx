"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2, Clock } from "lucide-react";
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

const SAMPLE_COMMENTS = [
  "Može doći odmah i riješiti problem!",
  "Odličan majstor, preporučujem.",
  "Brz i pouzdan, posao završen kako treba.",
];

export function ReviewCardsSection() {
  const [handymen, setHandymen] = useState<Handyman[]>([]);

  useEffect(() => {
    fetch("/api/handymen?limit=3&sort=rating")
      .then((res) => res.json())
      .then((data) => setHandymen(data.items ?? data.handymen ?? []))
      .catch(() => {});
  }, []);

  if (handymen.length === 0) return null;

  return (
    <section className="mt-12 md:mt-16">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Recenzije Klijenata</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {handymen.slice(0, 3).map((h, idx) => {
            const isVerified = h.verifiedStatus === "VERIFIED";
            const imgSrc = h.avatarUrl ?? HERO_IMAGE;
            return (
              <div
                key={h.id}
                className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <Image src={imgSrc} alt="" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0F172A]">{h.name ?? "Majstor"}</p>
                    <p className="text-sm text-[#475569]">{h.categories[0] ?? "Usluge"}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-[#0F172A]">{h.ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-4">
                  {isVerified && (
                    <p className="flex items-center gap-2 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Verifikovan
                    </p>
                  )}
                  {h.averageResponseMinutes != null && (
                    <p className="flex items-center gap-2 text-sm text-emerald-600">
                      <Clock className="h-4 w-4" />
                      {h.averageResponseMinutes} min odgovora
                    </p>
                  )}
                  <p className="text-sm font-medium text-[#0F172A]">
                    Ponuda: {h.completedJobsCount != null && h.completedJobsCount > 0 ? "Po dogovoru" : "Po dogovoru"}
                  </p>
                </div>
                <p className="mt-4 text-sm text-[#475569]">
                  {SAMPLE_COMMENTS[idx % SAMPLE_COMMENTS.length]}
                </p>
                <Link
                  href={`/handyman/${h.id}`}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#2563EB] text-[15px] font-semibold text-white transition hover:bg-[#1D4ED8]"
                >
                  Pogledaj profil
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
