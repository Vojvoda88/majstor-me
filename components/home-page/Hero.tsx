"use client";

import Image from "next/image";
import Link from "next/link";
import { HERO_IMAGE } from "@/lib/homepage-data";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import { t } from "@/lib/i18n/messages";

export function Hero() {
  const locale = useUiLanguage();
  return (
    <section className="relative flex min-h-[min(88dvh,690px)] w-full items-center justify-center overflow-hidden rounded-b-[1.1rem] px-4 pb-12 pt-[max(4.5rem,env(safe-area-inset-top)+3.25rem)] text-white sm:px-5 md:min-h-[760px] md:rounded-b-[1.5rem] md:pb-20 md:pt-28">
      <Image
        src={HERO_IMAGE}
        alt={t(locale, "home.hero.imageAlt", "Majstor na poslu")}
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
        <h1 className="font-display mb-4 text-[1.72rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2rem] md:mb-5 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Treba vam majstor?
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-100/95 sm:text-base md:mb-8 md:text-lg md:leading-relaxed">
          Objavite zahtjev — majstor vas pozove.
        </p>

        <div className="mx-auto mt-2 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4">
          <Link
            href="/request/create"
            className="inline-flex h-14 min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-6 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-105 active:scale-[0.98] sm:px-8"
          >
            Zatraži majstora
          </Link>
          <Link
            href="/register?type=majstor"
            className="inline-flex h-14 min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-500/25 to-amber-600/15 px-6 text-base font-bold text-amber-50 shadow-lg shadow-amber-900/25 ring-1 ring-amber-200/30 backdrop-blur-md transition hover:from-amber-500/35 hover:to-amber-600/25 hover:text-white active:scale-[0.98] sm:px-8"
          >
            Nudite usluge? Registrujte se
          </Link>
        </div>

        <div className="mx-auto mt-4 grid w-full max-w-3xl grid-cols-1 gap-2.5 text-left sm:mt-5 sm:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-xl font-extrabold leading-none text-white">70+</p>
            <p className="mt-1 text-xs font-semibold text-slate-100">majstora i usluga</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-sm font-extrabold leading-tight text-white">Zatražite majstora</p>
            <p className="mt-1 text-xs font-semibold text-slate-100">100% besplatno</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-sm font-extrabold leading-tight text-white">Objavi zahtjev</p>
            <p className="mt-1 text-xs font-semibold text-slate-100">za manje od minut</p>
          </div>
        </div>
      </div>
    </section>
  );
}
