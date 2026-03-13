"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronDown } from "lucide-react";
import { HOMEPAGE_CATEGORIES, CATEGORY_IMAGES } from "@/lib/homepage-data";

const INITIAL_COUNT = 8;

export function CategoriesSection() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? HOMEPAGE_CATEGORIES : HOMEPAGE_CATEGORIES.slice(0, INITIAL_COUNT);
  const hasMore = HOMEPAGE_CATEGORIES.length > INITIAL_COUNT;

  return (
    <section id="kategorije" className="py-10 lg:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Popularne usluge</p>
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Pronađi pravu uslugu za svoj dom</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((title) => (
          <Link
            key={title}
            href={`/request/create?category=${encodeURIComponent(title)}`}
            className="group overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="relative h-[180px] overflow-hidden">
              <Image
                src={CATEGORY_IMAGES[title] || CATEGORY_IMAGES["Sitne kućne popravke"]}
                alt={title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-base font-bold text-slate-900">{title}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-600">4.8</span>
                <span>• 20+ recenzija</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {expanded ? "Prikaži manje" : "Vidi još kategorija"}
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
}
