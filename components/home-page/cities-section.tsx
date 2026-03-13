"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

const INITIAL_COUNT = 8;

export function CitiesSection() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? HOMEPAGE_CITIES : HOMEPAGE_CITIES.slice(0, INITIAL_COUNT);
  const hasMore = HOMEPAGE_CITIES.length > INITIAL_COUNT;

  return (
    <section id="gradovi" className="py-10 lg:py-12">
      <div className="mb-6">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Cijela Crna Gora</p>
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Gradovi u kojima rastemo</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((city) => (
          <Link
            key={city.name}
            href={`/request/create?city=${encodeURIComponent(city.name)}`}
            className="group relative overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-black text-white drop-shadow-sm sm:text-xl">{city.name}</h3>
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
            {expanded ? "Prikaži manje" : "Vidi sve gradove"}
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
}
