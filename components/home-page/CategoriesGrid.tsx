"use client";

import Link from "next/link";
import { ArrowRight, Droplets, Zap, Grid3X3, Wind, PaintBucket, Sparkles } from "lucide-react";
import { CategoryTile } from "./category-tile";

const CATEGORIES = [
  {
    slug: "vodoinstalater",
    title: "Vodoinstalater",
    subtitle: "Curenja, bojleri, slavine",
    imageSrc:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80&auto=format&fit=crop",
    Icon: Droplets,
  },
  {
    slug: "elektricar",
    title: "Električar",
    subtitle: "Kvarovi, osigurači, instalacije",
    imageSrc:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80&auto=format&fit=crop",
    Icon: Zap,
  },
  {
    slug: "keramicar",
    title: "Keramičar",
    subtitle: "Kupatila, pločice, fugovanje",
    imageSrc:
      "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=800&q=80&auto=format&fit=crop",
    Icon: Grid3X3,
  },
  {
    slug: "klima-servis",
    title: "Klima servis",
    subtitle: "Montaža, servis, čišćenje",
    imageSrc:
      "https://images.unsplash.com/photo-1595467793069-45069736f88d?w=800&q=80&auto=format&fit=crop",
    Icon: Wind,
  },
  {
    slug: "gipsar",
    title: "Molerski radovi",
    subtitle: "Krečenje, gletovanje, osvježenje prostora",
    imageSrc:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80&auto=format&fit=crop",
    Icon: PaintBucket,
  },
  {
    slug: "ciscenje",
    title: "Čišćenje",
    subtitle: "Stanovi, lokali, dubinsko čišćenje",
    imageSrc:
      "https://images.unsplash.com/photo-1628177142898-93b36a82fde4?w=800&q=80&auto=format&fit=crop",
    Icon: Sparkles,
  },
];

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="py-20 md:py-28">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between md:mb-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-4xl lg:text-[2.35rem]">
            Popularne kategorije
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-700 md:text-lg">
            Najtraženije usluge širom Crne Gore — od hitnih popravki do renoviranja.
          </p>
        </div>
        <Link
          href="/categories"
          className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-bold text-brand-navy underline decoration-slate-300 underline-offset-[5px] transition hover:text-blue-800 hover:decoration-amber-500/80 md:pt-1 md:text-[15px]"
        >
          Sve kategorije (16)
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
