"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { CATEGORY_IMAGES } from "@/lib/homepage-data";

const TOP_6 = CATEGORY_CONFIG.slice(0, 6);

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="mt-12 md:mt-16">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Popularne Kategorije</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
          {TOP_6.map((cat) => {
            const imgSrc = CATEGORY_IMAGES[cat.displayName] ?? CATEGORY_IMAGES["Vodoinstalater"];
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative block overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={imgSrc}
                    alt={cat.displayName}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 p-4 text-base font-semibold text-white">
                  {cat.displayName}
                </p>
              </Link>
            );
          })}
        </div>
        <Link
          href="/category/vodoinstalater"
          className="mt-6 inline-block text-[15px] font-medium text-[#475569] transition hover:text-[#2563EB]"
        >
          Vidi još kategorija →
        </Link>
      </div>
    </section>
  );
}
