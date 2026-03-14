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
    <section id="kategorije" className="py-10 sm:py-14 lg:py-16">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900 sm:mb-6 sm:text-3xl">
        Popularne kategorije
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:grid-cols-6">
        {POPULAR_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon];
          const image = CATEGORY_IMAGES[cat.displayName] || "/images/categories/handyman.jpg";
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex min-h-[120px] cursor-pointer flex-col rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md active:scale-[0.98] sm:min-h-0 sm:p-6"
            >
              <div className="relative flex h-12 flex-1 items-center justify-center sm:h-14">
                {Icon ? (
                  <Icon className="h-10 w-10 text-blue-600 transition group-hover:scale-110" />
                ) : (
                  <div className="relative h-14 w-14">
                    <Image
                      src={image}
                      alt={cat.displayName}
                      fill
                      className="object-cover opacity-60 rounded-lg"
                      sizes="56px"
                    />
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 sm:mt-3 sm:text-base">{cat.displayName}</h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
