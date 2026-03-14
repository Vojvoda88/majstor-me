"use client";

import Image from "next/image";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE_FALLBACK } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative flex min-h-[600px] w-full items-center justify-center overflow-hidden px-4 py-20 text-white md:min-h-[720px] md:py-28">
      <Image
        src={HERO_IMAGE_FALLBACK}
        alt="Majstor na poslu"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="font-display mb-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-[3.5rem] lg:leading-[1.15] xl:text-[4rem]">
          Pronađite majstora
          <br />
          za svaki posao
        </h1>
        <p className="mx-auto mb-14 max-w-lg text-lg font-medium leading-relaxed text-white/95 md:text-xl">
          Poveži se sa provjerenim majstorima u tvom gradu
        </p>
        <HeroSearch />
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-white/80">
          <span className="flex items-center gap-2">✓ Verifikovani majstori</span>
          <span className="flex items-center gap-2">✓ Besplatno objavljivanje</span>
          <span className="flex items-center gap-2">✓ Brze ponude</span>
        </div>
      </div>
    </section>
  );
}
