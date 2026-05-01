import Link from "next/link";
import { Bell, Check, FileText, UserRoundCheck } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: FileText,
    text: "Opišite šta vam treba",
  },
  {
    n: 2,
    icon: Bell,
    text: "Majstori dobijaju obavještenje",
  },
  {
    n: 3,
    icon: UserRoundCheck,
    text: "Javljaju vam se dostupni majstori",
  },
] as const;

const VALUE_POINTS = [
  "Više dostupnih majstora",
  "Brzi odgovori",
  "Direktan dogovor bez posrednika",
  "Bez traženja po oglasima",
] as const;

const TRUST_POINTS = ["100% besplatno", "Bez obaveza", "Možete odbiti ponude"] as const;

export function PostHeroConversionSection() {
  return (
    <section
      className="border-t border-slate-200/85 bg-gradient-to-b from-slate-50/95 via-white to-white"
      aria-labelledby="post-hero-how-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 md:px-6 md:py-14">
        <div className="space-y-12 md:space-y-14">
          {/* How it works */}
          <div>
            <h2
              id="post-hero-how-heading"
              className="font-display text-center text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl"
            >
              Kako do majstora u 3 koraka
            </h2>
            <ol className="mt-8 grid list-none gap-4 pl-0 sm:grid-cols-3 sm:gap-5 md:mt-10 md:gap-6">
              {STEPS.map(({ n, icon: Icon, text }) => (
                <li
                  key={n}
                  className="flex gap-3.5 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm ring-1 ring-slate-100/80 sm:flex-col sm:items-center sm:text-center sm:gap-3 md:p-5"
                >
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white shadow-md sm:h-11 sm:w-11">
                      {n}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-brand-navy sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                  <p className="min-w-0 text-sm font-semibold leading-snug text-slate-800 md:text-[15px]">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-slate-200/90 to-transparent" />

          {/* Value */}
          <div>
            <h2 className="font-display text-center text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
              Šta dobijate kada pošaljete zahtjev
            </h2>
            <ul className="mx-auto mt-6 max-w-xl space-y-2.5 md:mt-8 md:space-y-3">
              {VALUE_POINTS.map((label) => (
                <li
                  key={label}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-50 md:text-[15px]"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-slate-200/90 to-transparent" />

          {/* Trust */}
          <div>
            <h2 className="font-display text-center text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
              Nema komplikacija
            </h2>
            <ul className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center md:mt-8 md:gap-3">
              {TRUST_POINTS.map((label) => (
                <li
                  key={label}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-2.5 text-center text-sm font-semibold text-slate-800 md:text-[15px]"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-slate-200/90 to-transparent" />

          {/* Final CTA */}
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-800/95 via-brand-navy to-[#152a45] px-5 py-8 text-center text-white shadow-[0_20px_48px_-24px_rgba(15,23,42,0.35)] md:px-8 md:py-10">
            <h2 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl md:text-3xl">
              Spremni da nađete majstora?
            </h2>
            <Link
              href="/request/create"
              className="mt-6 inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-8 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-105 active:scale-[0.98] md:mt-8 md:h-[52px] md:px-10"
            >
              Zatraži majstora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
