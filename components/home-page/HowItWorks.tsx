"use client";

import Link from "next/link";
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  Unlock,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tri koraka — korisniku samo brzina, jednostavnost, besplatna objava. */
const USER_STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Objavite šta vam treba",
    desc: "Kratak opis, grad, po želji slike — objava je besplatna.",
  },
  {
    n: 2,
    icon: MessageSquare,
    title: "Kratak admin pregled, pa distribucija",
    desc: "Zahtjev prvo ide na brzu provjeru, zatim se prikazuje odgovarajućim majstorima.",
  },
  {
    n: 3,
    icon: CheckCircle2,
    title: "Pregledajte ponude i birajte",
    desc: "Kada stignu ponude, uporedite ih i izaberite majstora koji vam odgovara — u svom ritmu.",
  },
] as const;

/** Copy za sekciju „Kako radi za majstore“ — tri koraka (bez ponavljanja CTA bloka ispod). */
const HANDYMAN_STEPS = [
  {
    n: 1,
    icon: UserPlus,
    title: "Besplatan profil i onboarding",
    desc: "Registracija je besplatna. Nakon pregleda profila od admina otvarate puni pristup poslovima.",
    featured: true as const,
  },
  {
    n: 2,
    icon: Smartphone,
    title: "Obavještenja za odobrene poslove",
    desc: "Kada je zahtjev odobren i relevantan za vašu branšu/lokaciju, dobijate obavještenje.",
    featured: false as const,
  },
  {
    n: 3,
    icon: Unlock,
    title: "Pregled besplatno, kontakt kad odgovara",
    desc: "Opis i slike vidite prije plaćanja. Ako vam posao odgovara, otključavate kontakt i šaljete ponudu.",
    featured: false as const,
  },
] as const;

const cardShell =
  "flex min-h-full flex-col rounded-3xl border border-slate-100/95 bg-white p-6 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-slate-100/60 lg:p-7";

function StepGrid({
  steps,
  colsClass,
}: {
  steps: readonly { n: number; icon: LucideIcon; title: string; desc: string }[];
  colsClass: string;
}) {
  return (
    <div className={cn("grid gap-5 md:gap-6", colsClass)}>
      {steps.map((step) => (
        <div key={step.n} className={cardShell}>
          <div className="flex items-start gap-4 md:block">
            <div className="flex items-start justify-between gap-3 md:block">
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50/90 text-brand-navy ring-1 ring-sky-100/70 md:h-12 md:w-12 md:rounded-2xl"
                aria-hidden
              >
                <step.icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2} />
              </span>
              <span className="hidden min-h-[1.75rem] min-w-[1.75rem] items-center justify-center rounded-full bg-brand-navy/90 px-2.5 text-xs font-bold tabular-nums text-white shadow-sm md:inline-flex">
                {step.n}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 break-words font-display text-[17px] font-bold leading-snug text-brand-navy md:mt-4 md:text-base lg:text-[17px]">
                  {step.title}
                </h3>
                <span className="inline-flex min-h-[1.75rem] min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-brand-navy/90 px-2.5 text-xs font-bold tabular-nums text-white shadow-sm md:hidden">
                  {step.n}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 sm:mt-2 sm:text-[15px]">{step.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const userWrap = "rounded-[1.5rem] border border-slate-100/90 bg-gradient-to-b from-slate-50/95 to-white p-4 sm:p-6 md:rounded-[1.75rem] md:p-8 lg:p-10";

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
      "relative flex min-h-full flex-col overflow-hidden rounded-2xl p-6 md:p-8",
      "border-2 border-slate-900/[0.07] bg-gradient-to-b from-white via-slate-50/30 to-white",
      "shadow-[0_16px_48px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.04]"
    );
  }
  return cn(
    "flex min-h-full flex-col rounded-2xl border border-slate-200/85 bg-white p-6 md:p-7",
    "shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.09)]"
  );
}

function HandymanStepGrid({ steps }: { steps: readonly HandymanStep[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-7">
      {steps.map((step) => (
        <div key={step.n} className={handymanCardClass(step.featured)}>
          {step.featured && (
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 opacity-90"
              aria-hidden
            />
          )}
          {step.featured && (
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Glavni benefit</p>
          )}
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12",
                step.featured
                  ? "bg-slate-900 text-white shadow-inner shadow-black/10"
                  : "bg-slate-100 text-brand-navy ring-1 ring-slate-200/80"
              )}
              aria-hidden
            >
              <step.icon className={cn("h-6 w-6", step.featured && "text-white")} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "font-display font-bold leading-snug text-slate-900",
                  step.featured ? "text-[17px] md:text-xl" : "text-[17px] md:text-[17px]"
                )}
              >
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">{step.desc}</p>
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
        <h2 className="font-display text-[1.6rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl">
          Kako radi za korisnike
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base md:text-lg">
          Tri koraka — objava zahtjeva je besplatna.
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-6xl md:mt-10">
        <div className={userWrap}>
          <StepGrid steps={USER_STEPS} colsClass="md:grid-cols-3" />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-500 md:text-[15px]">
          Dobijate više ponuda bez zvanja redom — sve na jednom mjestu.
        </p>
      </div>
    </section>
  );
}

export function HowItWorksForHandymen() {
  return (
    <section
      id="kako-radi-majstore"
      className="scroll-mt-24 border-t border-slate-200/60 bg-gradient-to-b from-slate-50/40 via-white to-white py-12 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-5 md:max-w-none">
        <h2 className="font-display text-[1.6rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl">
          Kako radi za majstore
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-600 sm:text-base md:text-lg">
          Besplatna registracija, jasan proces odobrenja i poslovi koji stižu po vašoj branši.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-4 sm:px-5 md:mt-12">
        <HandymanStepGrid steps={HANDYMAN_STEPS} />
      </div>
    </section>
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
