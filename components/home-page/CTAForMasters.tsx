import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";

export function CTAForMasters() {
  return (
    <section className="px-1 py-10 sm:px-0 md:py-16" aria-labelledby="cta-majstor-naslov">
      <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/35 to-slate-50/40 p-5 shadow-[0_20px_56px_-28px_rgba(15,23,42,0.12)] ring-1 ring-slate-100/80 sm:rounded-[1.75rem] sm:p-7 md:rounded-[2rem] md:p-12 lg:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.12] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-400/18 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute right-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-600/[0.06] blur-2xl" aria-hidden />

        <div className="relative mx-auto max-w-3xl text-center md:max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Za majstore</p>
          <h3 id="cta-majstor-naslov" className="mt-3 font-display text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl md:text-[2rem]">
            Uđite besplatno. Počnite sa 1000 kredita.
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 sm:text-base md:text-lg">
            <strong className="font-semibold text-slate-800">Bez pretplate.</strong> Novi majstori dobijaju{" "}
            <strong className="font-semibold text-brand-navy">1000 kredita za početak</strong> — obično dovoljno za{" "}
            <strong className="font-semibold text-brand-navy">prvih pet standardnih ponuda</strong> (standardni posao = 200 kredita).{" "}
            Plaćate samo kada otključate kontakt za posao koji vam odgovara.
          </p>

          <div
            id="majstor-krediti"
            className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-600 sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 shadow-sm">
              <Coins className="h-3.5 w-3.5 text-blue-600" aria-hidden />
              1 kredit = 1 cent
            </span>
            <span className="max-w-[100%] rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1.5 text-center shadow-sm sm:px-3">
              Standardna ponuda za manje od 2 €
            </span>
          </div>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/register?type=majstor"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_36px_-10px_rgba(245,158,11,0.4)] transition hover:brightness-105 active:scale-[0.99]"
            >
              Registruj se kao majstor
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#majstor-krediti"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 text-base font-semibold text-brand-navy transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
            >
              Kako rade krediti
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
