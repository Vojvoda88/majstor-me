"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Zap,
  Grid3X3,
  Paintbrush,
  Hammer,
  Key,
  Building2,
  Layout,
  Thermometer,
  Flame,
  Package,
  Truck,
  Sparkles,
  TreeDeciduous,
  Square,
  Home,
} from "lucide-react";
import { POPULAR_CATEGORIES } from "@/lib/categories";
import { CATEGORY_IMAGES } from "@/lib/homepage-data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Zap,
  Grid3X3,
  Paintbrush,
  Hammer,
  Key,
  Building2,
  Layout,
  Thermometer,
  Flame,
  Package,
  Truck,
  Sparkles,
  TreeDeciduous,
  Square,
  Home,
};

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="py-10 lg:py-12">
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          Popularne kategorije
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {POPULAR_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon];
          const image = CATEGORY_IMAGES[cat.displayName] || "/images/categories/handyman.jpg";
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
            >
              <div className="relative flex h-20 items-center justify-center bg-slate-50">
                {Icon ? (
                  <Icon className="h-10 w-10 text-blue-600 transition group-hover:scale-110" />
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={image}
                      alt={cat.displayName}
                      fill
                      className="object-cover opacity-60"
                      sizes="200px"
                    />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-slate-900">{cat.displayName}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
