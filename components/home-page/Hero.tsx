"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

const TRUST = [
  { icon: Sparkles, label: "Za vas kao korisnika — potpuno besplatno" },
  { icon: Zap, label: "Jedan oglas, više ponuda majstora" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[min(88dvh,620px)] w-full items-center justify-center overflow-hidden rounded-b-[1.75rem] px-4 pb-12 pt-[max(4.5rem,env(safe-area-inset-top)+3.25rem)] text-white sm:px-5 md:min-h-[720px] md:rounded-b-[2rem] md:pb-24 md:pt-32">
      <Image
        src={HERO_IMAGE}
        alt="Majstor na poslu"
        fill
        className="pointer-events-none object-cover object-[center_35%] md:object-[center_25%]"
        priority
        sizes="100vw"
      />
      {/* Dodatni dim na uskim ekranima (portretna slika + jači kontrast za tekst) */}
      <div className="pointer-events-none absolute inset-0 bg-black/30 md:bg-transparent" aria-hidden />
      {/* Premium overlay: deep navy + vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy/95 via-brand-navy/75 to-brand-navy/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,158,11,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-4xl text-center pointer-events-auto">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/95 backdrop-blur-sm md:mb-4 md:px-4 md:text-[13px] md:tracking-[0.2em]">
          Pronađite majstora — brzo i jasno
        </p>
        <h1 className="font-display mb-4 text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2rem] md:mb-5 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Besplatno pronađite majstora,
          <br />
          <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">
            objavite posao bez plaćanja.
          </span>
        </h1>
        <p className="mx-auto mb-7 max-w-xl text-[15px] font-medium leading-relaxed text-slate-200/95 sm:text-base md:mb-10 md:text-lg md:leading-relaxed">
          Za vas kao korisnika sve je besplatno: opišete šta vam treba, sačekate ponude i birate majstora. Mi povezujemo —
          vi ne plaćate platformu.
        </p>

        <div className="mx-auto max-w-2xl">
          <HeroSearch />
        </div>

        <div className="mt-6 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3 md:mt-8">
          <Link
            href="/request/create"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.98] md:h-[52px] md:px-10"
          >
            Objavi besplatan zahtjev
          </Link>
          <Link
            href="/#kako-radi-majstore"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] md:px-8"
          >
            Koraci za majstore
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:mt-10 md:gap-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex max-w-[min(100%,20rem)] items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:max-w-none sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <Icon className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              {label}
            </span>
          ))}
        </div>
        <p className="relative z-30 mt-5 text-center md:mt-6">
          <Link
            href="/register?type=majstor"
            className="inline-block min-h-[44px] touch-manipulation text-sm font-semibold text-amber-200/95 underline decoration-amber-400/45 underline-offset-4 transition hover:text-white active:opacity-90"
          >
            Registrujte se kao majstor →
          </Link>
        </p>
      </div>
    </section>
  );
}
