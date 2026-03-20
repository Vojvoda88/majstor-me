"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

const TRUST = [
  { icon: ShieldCheck, label: "Provjereni profili" },
  { icon: Zap, label: "Ponude za kratko" },
  { icon: Sparkles, label: "Besplatno za korisnike" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[min(100dvh,820px)] w-full items-center justify-center overflow-hidden px-4 pb-20 pt-[max(7rem,env(safe-area-inset-top)+5.5rem)] text-white sm:px-5 md:min-h-[720px] md:pb-24 md:pt-32">
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
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/95 backdrop-blur-sm md:text-[13px]">
          Marketplace za majstore u Crnoj Gori
        </p>
        <h1 className="font-display mb-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Majstori za cijelu Crnu Goru,
          <br />
          <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">
            na jednom mjestu.
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-base font-medium leading-relaxed text-slate-200/95 md:text-lg md:leading-relaxed">
          Pošaljite zahtjev jednom — dobijte više ponuda od majstora iz vašeg grada. Bez zvanja redom, bez provizije za vas.
        </p>

        <div className="mx-auto max-w-2xl">
          <HeroSearch />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/request/create"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-lg shadow-amber-500/25 transition hover:brightness-105 active:scale-[0.98] md:h-[52px] md:px-10"
          >
            Objavi besplatan zahtjev
          </Link>
          <Link
            href="/categories"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98]"
          >
            Pregled kategorija
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {TRUST.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md"
            >
              <Icon className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
              {label}
            </span>
          ))}
        </div>
        <p className="relative z-30 mt-8">
          <Link
            href="/register?type=majstor"
            className="inline-block min-h-[44px] touch-manipulation py-2 text-sm font-semibold text-amber-200/90 underline decoration-amber-400/50 underline-offset-4 transition hover:text-white active:opacity-90"
          >
            Nudite usluge? Registrujte se kao majstor →
          </Link>
        </p>
      </div>
    </section>
  );
}
