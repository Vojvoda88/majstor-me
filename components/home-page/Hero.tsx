"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE_FALLBACK } from "@/lib/homepage-data";
import { POPULAR_CATEGORIES } from "@/lib/categories";

const HERO_PILLS = POPULAR_CATEGORIES.slice(0, 6);

export function Hero() {
  return (
    <section className="relative flex min-h-[640px] w-full items-center justify-center overflow-hidden px-4 py-24 text-white md:min-h-[720px] md:py-32">
      <Image
        src={HERO_IMAGE_FALLBACK}
        alt="Majstor na poslu"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/75"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="font-display mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-[3.5rem] lg:leading-[1.1] xl:text-[4rem]">
          Pronađi provjerene majstore.
          <br />
          <span className="text-white/95">Brzo i besplatno.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-white/90 md:text-xl">
          Objavi zahtjev besplatno. Primaj ponude. Izaberi najbolju.
        </p>
        <HeroSearch />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {HERO_PILLS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/request/create?category=${encodeURIComponent(cat.internalCategory)}`}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white/50"
            >
              {cat.displayName}
            </Link>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-white/90">
          <span className="flex items-center gap-2">✓ Verifikovani majstori</span>
          <span className="flex items-center gap-2">✓ Besplatno objavljivanje</span>
          <span className="flex items-center gap-2">✓ Brze ponude</span>
        </div>
        <p className="mt-6">
          <Link
            href="/register"
            className="text-sm font-semibold text-white/90 underline underline-offset-2 transition hover:text-white"
          >
            Nudite usluge? Prijavite se kao majstor →
          </Link>
        </p>
      </div>
    </section>
  );
}
