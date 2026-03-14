"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2 } from "lucide-react";
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
  "Verifikovan. Ponosan majstor zanata, rješavam sve vaše probleme.",
  "Verifikovan. Radim kvalitetno i brzo, preporučujem se svima.",
  "Verifikovan. Kvalitetna keramika i precizan rad su moj moto.",
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
    <section className="py-20">
      <h2 className="mb-10 text-2xl font-bold text-gray-900">Najbolje Ocijenjeni Majstori</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {handymen.slice(0, 3).map((h, idx) => {
          const isVerified = h.verifiedStatus === "VERIFIED";
          const imgSrc = h.avatarUrl ?? HERO_IMAGE;
          return (
            <div
              key={h.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <Image src={imgSrc} alt="" fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{h.name ?? "Majstor"}</h4>
                  <p className="text-xs text-gray-400">{h.categories[0] ?? "Usluge"}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold text-gray-900">{h.ratingAvg.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <p className="mb-6 text-[13px] leading-snug text-gray-500">
                {isVerified && (
                  <>
                    <CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-500" /> Verifikovan{" "}
                    <br />
                  </>
                )}
                {SAMPLE_TEXTS[idx % SAMPLE_TEXTS.length].replace("Verifikovan. ", "").trim()}
              </p>
              <Link
                href={`/handyman/${h.id}`}
                className="flex w-full items-center justify-center rounded-lg bg-[#2563EB] py-3 font-bold text-white transition hover:bg-[#1D4ED8]"
              >
                Pogledaj profil
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
