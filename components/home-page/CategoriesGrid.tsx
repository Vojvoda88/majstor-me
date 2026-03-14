"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORY_CONFIG } from "@/lib/categories";

const CATEGORY_IMAGES: Record<string, string> = {
  Vodoinstalater: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop",
  Električar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop",
  Keramičar: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=400&auto=format&fit=crop",
  "Klima servis": "https://images.unsplash.com/photo-1595467793069-45069736f88d?w=400&auto=format&fit=crop",
};

const TOP_4 = CATEGORY_CONFIG.filter((c) =>
  ["Vodoinstalater", "Električar", "Keramičar", "Klima servis"].includes(c.displayName)
);

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="py-20">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">Popularne Kategorije</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TOP_4.map((cat) => {
          const imgSrc = CATEGORY_IMAGES[cat.displayName] ?? CATEGORY_IMAGES.Vodoinstalater;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative h-48 cursor-pointer overflow-hidden rounded-xl"
            >
              <Image
                src={imgSrc}
                alt={cat.displayName}
                fill
                className="object-cover transition duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 flex items-end bg-black/40 p-5">
                <span className="font-bold text-white">{cat.displayName}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href="/category/vodoinstalater"
        className="mt-6 inline-block text-sm font-semibold text-[#2563EB] hover:underline"
      >
        Vidi još kategorija →
      </Link>
    </section>
  );
}
