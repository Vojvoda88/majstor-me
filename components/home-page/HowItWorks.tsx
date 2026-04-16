"use client";

import Link from "next/link";
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  Unlock,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CREDIT_PACKAGES,
  HANDYMAN_START_BONUS_CREDITS,
  STANDARD_LEAD_CREDITS,
} from "@/lib/credit-packages";

const CREDITS_STARTER_PACK = CREDIT_PACKAGES.find((p) => p.id === "credits_1000")!;
const STARTER_PRICE_LABEL = `${CREDITS_STARTER_PACK.priceEur.toLocaleString("sr-Latn-ME", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})} €`;

/** Tri koraka — korisniku samo brzina, jednostavnost, besplatna objava. */
const USER_STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Objavite zahtjev besplatno",
    desc: "Kratak opis, grad i po želji slike. Objavljivanje je besplatno.",
  },
  {
    n: 2,
    icon: MessageSquare,
    title: "Majstori dobiju vaš oglas",
    desc: "Nakon kratke provjere, oglas ide majstorima kojima posao odgovara.",
  },
  {
    n: 3,
    icon: CheckCircle2,
    title: "Uporedite i izaberite",
    desc: "Kada stignu ponude, birate majstora bez zvanja redom.",
  },
] as const;

/** Copy za sekciju „Kako radi za majstore“ — brojevi iz lib/credit-packages + lib/lead-tier (standardni unlock). */
const HANDYMAN_STEPS = [
  {
    n: 1,
    icon: Smartphone,
    title: "Poslovi dolaze do vas",
    desc: "Dobijate obavještenje kada oglas odgovara vašoj branši i gradu.",
    featured: false as const,
  },
  {
    n: 2,
    icon: UserPlus,
    title: `Registracija besplatna + ${HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita`,
    desc: `Registracija je besplatna. Dobijate ${HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita i krećete bez pretplate.`,
    featured: true as const,
  },
  {
    n: 3,
    icon: Unlock,
    title: "Plaćate samo kada želite kontakt",
    desc: `Standardan kontakt: ${STANDARD_LEAD_CREDITS} kredita (oko 1,99 €). Nema pretplate.`,
    featured: false as const,
  },
] as const;

function StepGrid({
  steps,
}: {
  steps: readonly { n: number; icon: LucideIcon; title: string; desc: string }[];
}) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-[1.6rem] bg-gradient-to-br from-white/35 via-white/10 to-sky-100/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-sky-300 via-blue-300 to-indigo-300 md:hidden"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-[2.25rem] hidden h-px bg-gradient-to-r from-sky-300 via-blue-300 to-indigo-300 md:block"
        aria-hidden
      />
      <div className="relative grid gap-5 md:grid-cols-3 md:gap-4 lg:gap-6">
        {steps.map((step) => (
          <article
            key={step.n}
            className="group relative rounded-2xl border border-white/70 bg-white/88 p-4 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.5)] backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 md:h-full md:p-5"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
            <div className="flex items-start gap-3 md:flex-col md:gap-4">
              <div className="relative z-[1] flex w-10 shrink-0 items-center justify-center md:w-full md:justify-start">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-extrabold tabular-nums text-white shadow-[0_10px_24px_-12px_rgba(15,23,42,0.95)] ring-4 ring-white md:h-11 md:w-11 md:text-[15px]"
                  aria-hidden
                >
                  {step.n}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/60 bg-gradient-to-r from-sky-50/95 to-blue-50/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                  <step.icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                  Korak {step.n}
                </div>
                <h3 className="mt-2 font-display text-[17px] font-bold leading-snug text-slate-900 md:text-[18px]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">{step.desc}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

type HandymanStep = {
  n: number;
  icon: LucideIcon;
  title: string;
  desc: string;
  featured: boolean;
};

function handymanCardClass(featured: boolean): string {
  if (featured) {
    return cn(
      "relative flex min-h-full flex-col overflow-hidden rounded-2xl p-5 md:p-7",
      "border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white",
      "shadow-[0_22px_52px_-24px_rgba(15,23,42,0.6)]"
    );
  }
  return cn(
    "flex min-h-full flex-col rounded-2xl border border-slate-200/85 bg-white p-5 md:p-6",
    "shadow-[0_14px_34px_-24px_rgba(15,23,42,0.35)] transition-shadow duration-200 hover:shadow-[0_20px_40px_-22px_rgba(15,23,42,0.42)]"
  );
}

function HandymanStepGrid({ steps }: { steps: readonly HandymanStep[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7">
      {steps.map((step) => (
        <div key={step.n} className={handymanCardClass(step.featured)}>
          {step.featured && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300/70 via-amber-400/80 to-amber-300/70 opacity-95"
              aria-hidden
            />
          )}
          {step.featured && (
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/90">Glavni benefit</p>
          )}
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12",
                step.featured
                  ? "bg-white/15 text-white shadow-inner shadow-black/20 ring-1 ring-white/20"
                  : "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80"
              )}
              aria-hidden
            >
              <step.icon className={cn("h-6 w-6", step.featured && "text-white")} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "font-display font-bold leading-snug",
                  step.featured ? "text-[17px] md:text-xl" : "text-[17px] md:text-[17px]"
                )}
              >
                {step.title}
              </h3>
              <p className={cn("mt-3 text-sm leading-relaxed md:text-[15px]", step.featured ? "text-slate-100/95" : "text-slate-600")}>
                {step.desc}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HowItWorksForUsers() {
  return (
    <section id="kako-radi" className="scroll-mt-24 py-10 md:py-16">
      <div className="mx-auto max-w-3xl text-center md:max-w-none">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Za korisnike</p>
        <h2 className="mt-2 font-display text-[1.6rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl">
          Kako radi za korisnike
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base md:text-lg">
          Tri kratka koraka: objavite, dobijete ponude, izaberete.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-6xl md:mt-10">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-b from-slate-950/[0.035] via-white to-white p-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.58)] sm:p-5 md:p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"
            aria-hidden
          />
          <StepGrid steps={USER_STEPS} />
        </div>
        <div className="mx-auto mt-4 max-w-2xl text-center md:mt-5">
          <p className="text-sm text-slate-500 md:text-[15px]">
            Dobijate više ponuda bez zvanja redom — sve na jednom mjestu.
          </p>
          <Link
            href="/kako-radi-korisnici"
            className="mt-3 inline-flex items-center rounded-full border border-slate-300/80 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition hover:border-slate-400/70 hover:bg-white"
          >
            Detaljno za korisnike
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksForHandymen() {
  return (
    <section
      id="kako-radi-majstore"
      className="scroll-mt-24 border-t border-slate-200/60 bg-gradient-to-b from-slate-100/60 via-white to-white py-12 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="relative overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white p-5 shadow-[0_26px_70px_-44px_rgba(15,23,42,0.5)] sm:p-7 md:p-9">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/85 to-transparent"
            aria-hidden
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Majstori</p>
              <h2 className="mt-2 font-display text-[1.65rem] font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Za majstore
              </h2>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base md:text-lg">
                Bez pretplate. Dobijate {HANDYMAN_START_BONUS_CREDITS.toLocaleString("sr-Latn-ME")} start kredita i plaćate
                samo kada otključate kontakt klijenta.
              </p>
            </div>
            <div className="inline-flex max-w-[min(100%,20rem)] flex-col gap-1.5 sm:max-w-none sm:flex-row sm:items-center sm:gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
                <ShieldTruth />
                Nema pretplate • Obavještenja odmah
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
                <ShieldTruth />
                Standardan kontakt oko 1,99 €
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-6xl md:mt-10">
            <HandymanStepGrid steps={HANDYMAN_STEPS} />
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-4 text-center sm:px-6">
            <p className="text-sm font-medium leading-relaxed text-slate-700 sm:text-[15px]">
              Krediti nijesu pretplata. Troše se samo kada otključate kontakt za posao koji želite.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Hitniji poslovi i dodaci mogu koštati više kredita (do plafona u aplikaciji). Standardni, nije hitno:{" "}
              {STANDARD_LEAD_CREDITS} kredita.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:items-center">
            <Link
              href="/register?type=majstor"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 px-8 text-base font-bold text-brand-navy shadow-[0_16px_40px_-14px_rgba(245,158,11,0.55)] ring-1 ring-white/45 transition hover:brightness-105 active:scale-[0.99]"
            >
              Registruj se kao majstor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-center">
            <Link
              href="/kako-radi-majstori#krediti"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-300/90 bg-white/95 px-5 py-2 text-sm font-bold text-brand-navy shadow-[0_10px_24px_-18px_rgba(15,23,42,0.42)] transition hover:border-slate-400/80 hover:bg-white"
            >
              Kako rade krediti?
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function ShieldTruth() {
  return (
    <span
      aria-hidden
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white"
    >
      ✓
    </span>
  );
}

/** @deprecated Koristi HowItWorksForUsers + HowItWorksForHandymen na početnoj. */
export function HowItWorks() {
  return (
    <>
      <HowItWorksForUsers />
      <HowItWorksForHandymen />
      <div className="flex flex-col items-stretch gap-3 py-8 sm:flex-row sm:justify-center sm:gap-5">
        <Link
          href="/request/create"
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_36px_-10px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.99]"
        >
          Objavi besplatan zahtjev
        </Link>
        <Link
          href="/register?type=majstor"
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 text-base font-semibold text-brand-navy transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
        >
          Prijavite se kao majstor
        </Link>
      </div>
    </>
  );
}
