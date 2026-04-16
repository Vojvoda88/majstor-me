"use client";

import Link from "next/link";
import { ArrowRight, Droplets, Zap, Grid3X3, Wind, Hammer, Sparkles } from "lucide-react";
import { CategoryTile } from "./category-tile";

import { getCategoryImageUrl } from "@/lib/category-images";
import { ACTIVE_PUBLIC_CATEGORY_COUNT } from "@/lib/categories";

/** Samo 6 kartica na homepage — ostatak na /categories (kraći scroll, jasniji ritam). */
const CATEGORIES = [
  {
    slug: "vodoinstalater",
    title: "Vodoinstalater",
    subtitle: "Curenja, bojleri, slavine",
    imageSrc: getCategoryImageUrl("vodoinstalater"),
    Icon: Droplets,
  },
  {
    slug: "elektricar",
    title: "Električar",
    subtitle: "Kvarovi, osigurači, instalacije",
    imageSrc: getCategoryImageUrl("elektricar"),
    Icon: Zap,
  },
  {
    slug: "keramicar",
    title: "Keramičar",
    subtitle: "Kupatila, pločice, fugovanje",
    imageSrc: getCategoryImageUrl("keramicar"),
    Icon: Grid3X3,
  },
  {
    slug: "klima-servis",
    title: "Klima servis",
    subtitle: "Montaža, servis, čišćenje",
    imageSrc: getCategoryImageUrl("klima-servis"),
    Icon: Wind,
  },
  {
    slug: "stolar",
    title: "Stolar",
    subtitle: "Namještaj, kuhinje, popravke",
    imageSrc: getCategoryImageUrl("stolar"),
    Icon: Hammer,
  },
  {
    slug: "ciscenje",
    title: "Čišćenje",
    subtitle: "Stanovi, lokali, dubinsko čišćenje",
    imageSrc: getCategoryImageUrl("ciscenje"),
    Icon: Sparkles,
  },
];

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="py-10 md:py-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:mb-10">
        <div className="max-w-2xl">
          <h2 className="font-display text-[1.65rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl lg:text-[2.35rem]">
            Glavne kategorije
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-700 md:text-lg">
            Brzi izbor za šest najčešćih grupa. Ostale usluge — u pregledu svih kategorija.
          </p>
        </div>
        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-brand-navy shadow-sm transition hover:border-blue-200 hover:bg-blue-50/80 md:px-5 md:py-3 md:text-[15px]"
        >
            Pogledaj sve kategorije
          <span className="tabular-nums text-slate-500">({ACTIVE_PUBLIC_CATEGORY_COUNT})</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {CATEGORIES.map(({ slug, title, subtitle, imageSrc, Icon }) => (
          <CategoryTile
            key={slug}
            href={`/category/${slug}`}
            title={title}
            subtitle={subtitle}
            imageSrc={imageSrc}
            FallbackIcon={Icon}
          />
        ))}
      </div>
    </section>
  );
}
