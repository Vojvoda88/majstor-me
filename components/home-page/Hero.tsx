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
        <h1 className="font-display mb-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-[3.5rem] lg:leading-[1.1] xl:text-[4rem]">
          Majstori za cijelu Crnu Goru,
          <br />
          <span className="text-white/90">na jednom mjestu.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg font-medium leading-relaxed text-white/90 md:mb-10 md:text-xl">
          Opisite posao koji treba da se uradi i za par minuta dobijate ponude od provjerenih majstora iz vašeg grada.
        </p>

        <div className="mx-auto max-w-2xl">
          <HeroSearch />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/request/create"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 hover:shadow-lg md:text-base"
          >
            Objavi besplatan zahtjev
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 md:text-base"
          >
            Pregledaj kategorije majstora
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-white/85">
          <span className="flex items-center gap-2">✓ Verifikovani i ocijenjeni majstori</span>
          <span className="flex items-center gap-2">✓ Besplatno za korisnike</span>
          <span className="flex items-center gap-2">✓ Ponude za nekoliko minuta</span>
        </div>
        <p className="mt-6">
          <Link
            href="/register?type=majstor"
            className="text-sm font-semibold text-white/90 underline underline-offset-2 transition hover:text-white"
          >
            Nudite usluge? Registrujte se kao majstor →
          </Link>
        </p>
      </div>
    </section>
  );
}
