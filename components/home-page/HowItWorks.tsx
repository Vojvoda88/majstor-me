import Link from "next/link";
import { Fragment } from "react";
import { FileText, MessageSquare, CheckCircle2, ChevronRight } from "lucide-react";

const STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Objavite zahtjev",
    desc: "Opišite posao i grad — jasno i kratko.",
  },
  {
    n: 2,
    icon: MessageSquare,
    title: "Primite ponude",
    desc: "Majstori vam šalju direktne ponude.",
  },
  {
    n: 3,
    icon: CheckCircle2,
    title: "Izaberite majstora",
    desc: "Uporedite ocjene i cijene na jednom mjestu.",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="py-20 md:py-28">
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">
            Kako funkcioniše
          </h2>
          <p className="mt-3 max-w-xl text-base font-medium text-slate-700 md:text-lg">
            Tri jednostavna koraka do provjerenog majstora.
          </p>
        </div>
        <Link
          href="/request/create"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-navy underline decoration-slate-300 underline-offset-4 transition hover:decoration-amber-500 md:text-[15px]"
        >
          Objavi zahtjev
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-slate-50/90 p-4 shadow-[0_8px_32px_-12px_rgba(10,22,40,0.1)] md:p-6 lg:p-8">
        <div className="hidden items-stretch gap-2 md:flex lg:gap-3">
          {STEPS.map((step, idx) => (
            <Fragment key={step.n}>
              <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Korak {step.n}</p>
                <div className="mt-3 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white shadow-md">
                    {step.n}
                  </span>
                  <step.icon className="mt-2 h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-display text-base font-bold text-brand-navy lg:text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex w-7 shrink-0 items-center justify-center self-center text-slate-300 lg:w-9" aria-hidden>
                  <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="relative space-y-0 md:hidden">
          <div className="absolute bottom-3 left-[19px] top-3 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" aria-hidden />
          {STEPS.map((step) => (
            <div key={step.n} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white shadow-md ring-4 ring-slate-50">
                {step.n}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Korak {step.n}</p>
                <div className="mt-2 flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-amber-600" strokeWidth={2} aria-hidden />
                  <h3 className="font-display text-[15px] font-bold text-brand-navy">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
