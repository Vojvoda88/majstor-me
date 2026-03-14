"use client";

import Link from "next/link";
import Image from "next/image";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

export function CitiesGrid() {
  return (
    <section id="gradovi" className="py-10 lg:py-12">
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          Gradovi
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {HOMEPAGE_CITIES.map((city) => (
          <Link
            key={city.slug}
            href={`/grad/${city.slug}`}
            className="group relative overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-lg font-black text-white drop-shadow-sm sm:text-xl">
                  {city.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
