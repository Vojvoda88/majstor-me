import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const POINTS = [
  "Objava zahtjeva je besplatna za korisnike.",
  "Javljaju se majstori kojima posao odgovara — ne morate zvati redom.",
  "Uporedite ponude i ocjene na jednom mjestu, u svom ritmu.",
] as const;

/**
 * Konverzijski blok odmah ispod hero/stats — jasna vrijednost + CTA ka /request/create.
 * Bez lažnih brojeva; copy usklađen sa marketplace modelom.
 */
export function HomeConversionBand() {
  return (
    <section
      className="relative z-20 mx-auto max-w-6xl px-4 sm:px-5 md:px-6"
      aria-labelledby="home-value-heading"
    >
      <div className="rounded-[1.35rem] border border-slate-200/95 bg-white p-5 shadow-[0_20px_50px_-28px_rgba(10,22,40,0.18)] sm:p-7 md:rounded-[1.75rem] md:p-10">
        <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Za korisnike</p>
            <h2
              id="home-value-heading"
              className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-brand-navy md:text-3xl"
            >
              Jedan zahtjev, više ponuda — bez traženja majstora redom
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 md:text-base">
              Opišite posao jednom. Majstori iz vaše okoline vide zahtjev i javljaju se s ponudama. Vi birate šta vam odgovara
              — brzo i pregledno.
            </p>
            <ul className="mt-5 space-y-2.5 md:mt-6 md:space-y-3">
              {POINTS.map((text) => (
                <li key={text} className="flex gap-3 text-[15px] leading-snug text-slate-700 md:text-base">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
            <Link
              href="/request/create"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_36px_-10px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.99] sm:w-auto lg:w-full"
            >
              Objavi besplatan zahtjev
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
            </Link>
            <p className="text-center text-xs leading-relaxed text-slate-500 lg:text-left">
              Za nekoliko minuta. Bez plaćanja objave.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
