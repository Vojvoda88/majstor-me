"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2, ArrowRight } from "lucide-react";
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
};

const SAMPLE_TEXTS = [
  "Pouzdan majstor zanata, rješavam sve vaše probleme kvalitetno i na vrijeme.",
  "Radim kvalitetno i brzo. Preporučujem se svima koji traže profesionalca.",
  "Kvalitetna keramika i precizan rad su moj moto. Zadovoljni klijenti govore umjesto mene.",
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
    <section className="py-24">
      <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Najbolje Ocijenjeni Majstori
      </h2>
      <p className="mb-14 max-w-xl text-slate-500">
        Provjereni stručnjaci s najvišim ocjenama od zadovoljnih klijenata
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {handymen.slice(0, 3).map((h, idx) => {
          const isVerified = h.verifiedStatus === "VERIFIED";
          const imgSrc = h.avatarUrl ?? HERO_IMAGE;
          return (
            <div
              key={h.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-premium"
            >
              <div className="mb-6 flex items-center gap-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-md">
                  <Image src={imgSrc} alt="" fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{h.name ?? "Majstor"}</h4>
                    {isVerified && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{h.categories[0] ?? "Usluge"}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold text-slate-900">{h.ratingAvg.toFixed(1)}</span>
                    <span className="text-sm text-slate-400">({h.reviewCount} recenzija)</span>
                  </div>
                </div>
              </div>
              <p className="mb-6 text-[15px] leading-relaxed text-slate-600">
                {SAMPLE_TEXTS[idx % SAMPLE_TEXTS.length]}
              </p>
              <Link
                href={`/handyman/${h.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4ed8] py-3.5 text-[15px] font-bold text-white transition hover:bg-[#1e40af] group-hover:gap-3"
              >
                Pogledaj profil
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
