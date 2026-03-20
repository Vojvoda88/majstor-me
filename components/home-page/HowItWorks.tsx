import Link from "next/link";
import { Fragment } from "react";
import { FileText, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Opišite šta vam treba",
    desc: "Napišite koji posao treba da se uradi, dodajte grad i po želji fotografije. Što je zahtjev jasniji, ponude će biti preciznije.",
  },
  {
    n: 2,
    icon: MessageSquare,
    title: "Majstori vam šalju ponude",
    desc: "Provjereni majstori pregledaju vaš zahtjev i javljaju se ako im posao odgovara. Vi dobijate više ponuda na jednom mjestu.",
  },
  {
    n: 3,
    icon: CheckCircle2,
    title: "Uporedite i izaberite",
    desc: "Pregledajte ocjene, iskustvo i cijene, pa izaberite majstora koji vam najviše odgovara. Bez obaveze da prihvatite ponudu.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="kako-radi" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center md:max-w-none">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">
          Kako radi BrziMajstor.ME
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600 md:text-lg">
          Pošaljite jedan zahtjev i dobijte ponude od majstora iz svog grada — brzo, jednostavno i bez zvanja redom.
        </p>
      </div>

      {/* Premium wrapper */}
      <div className="mt-12 rounded-[1.75rem] border border-slate-200/90 bg-white p-4 shadow-[0_20px_50px_-24px_rgba(10,22,40,0.14)] sm:p-6 md:mt-14 md:p-8 lg:p-10">
        {/* Desktop: 3 kartice + konektori */}
        <div className="hidden items-stretch gap-2 md:flex lg:gap-3">
          {STEPS.map((step, idx) => (
            <Fragment key={step.n}>
              <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-[0_8px_30px_-18px_rgba(10,22,40,0.1)] md:p-7 lg:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-navy shadow-[0_4px_14px_-4px_rgba(10,22,40,0.12)] ring-1 ring-slate-200/80"
                    aria-hidden
                  >
                    <step.icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <span className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-full bg-brand-navy px-3 text-sm font-bold tabular-nums text-white shadow-sm">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold leading-snug text-brand-navy lg:text-xl">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 lg:text-[15px]">{step.desc}</p>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className="flex w-7 shrink-0 items-center justify-center self-center text-slate-400 lg:w-9"
                  aria-hidden
                >
                  <ChevronRight className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2} />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Mobile: stacked, više vazduha */}
        <div className="relative space-y-8 md:hidden">
          {STEPS.map((step, idx) => (
            <Fragment key={step.n}>
              <div className="relative rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-[0_8px_30px_-18px_rgba(10,22,40,0.1)]">
                <div className="flex items-start gap-4">
                  <span
                    className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-navy shadow-[0_4px_14px_-4px_rgba(10,22,40,0.12)] ring-1 ring-slate-200/80"
                    aria-hidden
                  >
                    <step.icon className="h-7 w-7" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-bold leading-snug text-brand-navy">{step.title}</h3>
                      <span className="inline-flex min-h-[2rem] min-w-[2rem] shrink-0 items-center justify-center rounded-full bg-brand-navy px-3 text-sm font-bold tabular-nums text-white shadow-sm">
                        {step.n}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{step.desc}</p>
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex justify-center py-0" aria-hidden>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                    <ChevronRight className="h-4 w-4 rotate-90" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Glavni CTA + sekundarni link */}
      <div className="mt-12 flex flex-col items-stretch gap-4 sm:mt-14 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
        <Link
          href="/request/create"
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_36px_-10px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.99]"
        >
          Objavi besplatan zahtjev
        </Link>
        <Link
          href="/categories"
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 text-base font-semibold text-brand-navy transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
        >
          Pogledaj kategorije
        </Link>
      </div>
    </section>
  );
}
