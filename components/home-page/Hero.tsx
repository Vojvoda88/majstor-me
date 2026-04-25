"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";
import { HERO_IMAGE } from "@/lib/homepage-data";

const TRUST = [
  { icon: Sparkles, label: "Jednostavno i brzo do pravog majstora" },
  { icon: Zap, label: "Za majstore: besplatna registracija + 1.000 kredita gratis" },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[min(88dvh,690px)] w-full items-center justify-center overflow-hidden rounded-b-[1.1rem] px-4 pb-12 pt-[max(4.5rem,env(safe-area-inset-top)+3.25rem)] text-white sm:px-5 md:min-h-[760px] md:rounded-b-[1.5rem] md:pb-20 md:pt-28">
      <Image
        src={HERO_IMAGE}
        alt="Majstor na poslu"
        fill
        className="pointer-events-none object-cover object-[center_35%] md:object-[center_25%]"
        priority
        sizes="100vw"
      />
      {/* Jači kontrast da hero tekst bude čitljiv na mobilnom. */}
      <div className="pointer-events-none absolute inset-0 bg-black/40 md:bg-black/20" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy/96 via-brand-navy/84 to-brand-navy/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,158,11,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-auto relative z-10 w-full max-w-4xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/95 backdrop-blur-sm md:mb-4 md:px-4 md:text-[13px] md:tracking-[0.18em]">
          Pronađite pravog majstora za svoj posao
        </p>
        <h1 className="font-display mb-4 text-[1.72rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2rem] md:mb-5 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Treba vam majstor?
          <br />
          <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">Objavite oglas za manje od 1 minuta.</span>
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-[15px] font-medium leading-relaxed text-slate-100 sm:text-base md:mb-8 md:text-lg md:leading-relaxed">
          Besplatna objava za korisnike. Majstorima stiže obavještenje čim se pojavi posao u blizini.
        </p>

        <div className="mt-2 flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center sm:gap-3 md:mt-4">
          <Link
            href="/request/create"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-8 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-105 active:scale-[0.98] md:h-[52px] md:px-10"
          >
            Pronađi majstora
          </Link>
          <Link
            href="/categories"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/15 active:scale-[0.98] md:px-8"
          >
            Pogledaj kategorije
          </Link>
          <Link
            href="/register?type=majstor"
            className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl border border-amber-300/45 bg-white/12 px-6 text-base font-semibold text-amber-100 shadow-lg shadow-amber-500/10 backdrop-blur-md transition hover:bg-white/18 hover:text-white active:scale-[0.98] md:px-8"
          >
            Registruj se kao majstor
          </Link>
        </div>
        <div className="mt-3 md:mt-4">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/25 bg-black/15 px-5 py-2.5 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-black/25 hover:text-white active:scale-[0.98]"
          >
            Već imate nalog? Prijavi se
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:mt-6 md:gap-4">
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
      </div>
    </section>
  );
}
