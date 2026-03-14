"use client";

import Image from "next/image";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative -mt-px w-full">
      <div className="relative h-[320px] w-full md:h-[480px] lg:h-[520px]">
        <Image
          src={HERO_IMAGE}
          alt="Majstor na poslu"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-center px-4 py-8 md:px-6 lg:max-w-7xl lg:px-8">
          <div className="mx-auto w-full max-w-4xl">
            <h1 className="max-w-xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              Pronađite majstora za svaki posao
            </h1>
            <p className="mt-3 max-w-md text-base text-white/90 md:text-lg">
              Poveži se sa provjerenim majstorima u tvom gradu
            </p>
            <div className="mt-6 md:mt-8">
              <HeroSearch />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
