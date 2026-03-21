"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  Eye,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  MapPinned,
  Unlock,
  Send,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

const USER_STEPS = [
  {
    n: 1,
    icon: FileText,
    title: "Opišite posao",
    desc: "Šta treba uraditi, koji grad, po želji fotografije. Što je jasnije, majstori lakše procjenjuju da li im posao odgovara.",
  },
  {
    n: 2,
    icon: Eye,
    title: "Majstori pregledaju zahtjev",
    desc: "Na osnovu opisa vide šta tražite — javljaju se oni kojima posao ima smisla. Vi ne morate zvati redom.",
  },
  {
    n: 3,
    icon: MessageSquare,
    title: "Dobijate ponude",
    desc: "Ponude i poruke na jednom mjestu. Uporedite cijene i ocjene prije nego što odlučite.",
  },
  {
    n: 4,
    icon: CheckCircle2,
    title: "Izaberite majstora",
    desc: "Odaberite ponudu koja vam najviše odgovara. Bez obaveze da odmah prihvatite.",
  },
] as const;

const HANDYMAN_STEPS = [
  {
    n: 1,
    icon: UserPlus,
    title: "Registrujete se kao majstor",
    desc: "Profil i kategorije su besplatni — bez pretplate.",
  },
  {
    n: 2,
    icon: MapPinned,
    title: "Vidite poslove iz oblasti i grada",
    desc: "Pregled opisa i slika je besplatan; kontakt tek kada vam posao odgovara.",
  },
  {
    n: 3,
    icon: Unlock,
    title: "Otključavate kontakt kreditima",
    desc: "Tek tada vidite telefon / Viber / WhatsApp. Krediti su obično 20–40 po kontaktu (hitnost + detalji).",
  },
  {
    n: 4,
    icon: Send,
    title: "Šaljete ponudu ili se direktno javljate",
    desc: "Možete koristiti formu ponude na platformi ili odmah pozvati korisnika — nakon otključavanja.",
  },
  {
    n: 5,
    icon: Coins,
    title: "Plaćate samo kada želite kontakt",
    desc: "Bez mjesečne pretplate — samo kada konkretno uzmete kontakt za posao koji vam ima smisla.",
  },
] as const;

export function HowItWorks() {
  const [audience, setAudience] = useState<"user" | "handyman">("user");
  const steps = audience === "user" ? USER_STEPS : HANDYMAN_STEPS;

  return (
    <section id="kako-radi" className="py-12 md:py-28">
      <div className="mx-auto max-w-3xl text-center md:max-w-none">
        <h2 className="font-display text-[1.65rem] font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl">
          Kako radi BrziMajstor.ME
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-600 sm:mt-4 sm:text-base md:text-lg">
          {audience === "user"
            ? "Četiri koraka: od opisa posla do izbora majstora — jednostavno, pregledno, bez zvanja redom."
            : "Za majstore: krediti, kontakt, ponuda — bez pretplate, platite samo kada želite kontakt."}
        </p>

        <div
          className="mx-auto mt-6 flex max-w-md justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/80 p-1 shadow-sm"
          role="tablist"
          aria-label="Za koga prikazujemo objašnjenje"
        >
          <button
            type="button"
            role="tab"
            aria-selected={audience === "user"}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl px-4 text-sm font-semibold transition",
              audience === "user" ? "bg-brand-navy text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setAudience("user")}
          >
            Za korisnike
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "handyman"}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl px-4 text-sm font-semibold transition",
              audience === "handyman" ? "bg-brand-navy text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setAudience("handyman")}
          >
            Za majstore
          </button>
        </div>
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-3.5 shadow-[0_24px_56px_-28px_rgba(10,22,40,0.16)] sm:p-5 md:mt-10 md:rounded-[1.75rem] md:p-8 lg:p-10">
        <div
          className={cn(
            "hidden gap-4 md:grid md:gap-5",
            audience === "user" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-5"
          )}
        >
          {steps.map((step) => (
            <div
              key={`${audience}-${step.n}`}
              className="flex min-h-full flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_10px_36px_-20px_rgba(10,22,40,0.12)] lg:p-7"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy/10"
                  aria-hidden
                >
                  <step.icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="inline-flex min-h-[1.75rem] min-w-[1.75rem] items-center justify-center rounded-full bg-brand-navy px-2.5 text-xs font-bold tabular-nums text-white shadow-sm">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold leading-snug text-brand-navy lg:text-[17px]">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-6 md:hidden">
          {steps.map((step, idx) => (
            <div key={`${audience}-m-${step.n}`}>
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_10px_36px_-20px_rgba(10,22,40,0.12)]">
                <div className="flex items-start gap-4">
                  <span
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy ring-1 ring-brand-navy/10"
                    aria-hidden
                  >
                    <step.icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-bold leading-snug text-brand-navy">{step.title}</h3>
                      <span className="inline-flex min-h-[1.75rem] min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-brand-navy px-2.5 text-xs font-bold tabular-nums text-white shadow-sm">
                        {step.n}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 sm:mt-2 sm:text-[15px]">{step.desc}</p>
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-1.5" aria-hidden>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                    <ChevronRight className="h-3.5 w-3.5 rotate-90" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:items-center sm:justify-center sm:gap-5">
        {audience === "user" ? (
          <>
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
          </>
        ) : (
          <>
            <Link
              href="/register?type=majstor"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 px-8 text-base font-bold text-brand-navy shadow-[0_14px_36px_-10px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.99]"
            >
              Prijavite se kao majstor
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 text-base font-semibold text-brand-navy transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
            >
              Već imate nalog? Prijava
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
