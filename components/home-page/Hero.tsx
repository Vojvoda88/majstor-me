"use client";

import Image from "next/image";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative flex min-h-[560px] w-full items-center justify-center px-4 py-16 text-white md:min-h-[680px] md:py-24">
      <Image
        src={HERO_IMAGE}
        alt="Majstor na poslu"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Pronađite majstora
          <br />
          za svaki posao
        </h1>
        <p className="mx-auto mb-12 max-w-xl text-lg font-medium text-white/90 md:text-xl">
          Poveži se sa provjerenim majstorima u tvom gradu
        </p>
        <HeroSearch />
      </div>
    </section>
  );
}
