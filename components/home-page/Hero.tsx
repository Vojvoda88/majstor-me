"use client";

import Image from "next/image";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative flex h-[500px] w-full items-center justify-center px-4 text-center text-white">
      <Image
        src={HERO_IMAGE}
        alt="Majstor na poslu"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
      />
      <div className="relative z-10 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Pronađite majstora za svaki posao
        </h1>
        <p className="mb-10 text-lg font-light opacity-90">
          Poveži se sa provjerenim majstorima u tvom gradu
        </p>
        <HeroSearch />
      </div>
    </section>
  );
}
