"use client";

import Link from "next/link";
import { Star, CheckCircle2, ArrowRight, Send } from "lucide-react";

const FEATURED = [
  {
    name: "Miloš Jovanović",
    city: "Tivat",
    specialty: "Roletne / tende",
    rating: "5.0",
    reviews: 34,
    reviewsLabel: "recenzije",
    blurb: "Pouzdan majstor zanata, rješavam vaše poslove kvalitetno i na vrijeme.",
    profileHref: "/grad/tivat",
  },
  {
    name: "Petar Nikolić",
    city: "Petnjica",
    specialty: "Brave / hitna otvaranja",
    rating: "4.9",
    reviews: 32,
    reviewsLabel: "recenzije",
    blurb: "Precizan i dostupan za hitne intervencije i svakodnevne bravarske radove.",
    profileHref: "/category/bravar",
  },
  {
    name: "Aleksandar Đurišić",
    city: "Kotor",
    specialty: "Bravar",
    rating: "4.8",
    reviews: 31,
    reviewsLabel: "recenzija",
    blurb: "Profesionalan pristup, jasna komunikacija i uredna izvedba svakog posla.",
    profileHref: "/grad/kotor",
  },
];

export function ReviewCardsSection() {
  return (
    <section id="istaknuti-majstori" className="py-20 md:py-28">
      <div className="mb-10 md:mb-12">
        <h2 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">
          Istaknuti majstori
        </h2>
        <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-700 md:text-lg">
          Primjeri dobrih ocjena i iskustva — tako znate šta možete očekivati kad birate majstora.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {FEATURED.map((h) => (
          <article
            key={h.name}
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_16px_48px_-16px_rgba(10,22,40,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-16px_rgba(10,22,40,0.18)]"
          >
            {/* Top — tamni premium header */}
            <div className="relative bg-gradient-to-br from-brand-navy via-[#0f2847] to-[#152f52] px-6 pb-10 pt-6 md:px-7 md:pt-7">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 90% 80% at 80% -20%, rgba(245,158,11,0.15), transparent 50%)",
                }}
              />
              <div className="relative flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-bold text-white shadow-lg backdrop-blur-sm">
                  {h.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold tracking-tight text-white md:text-xl">{h.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-slate-300">{h.city}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-200/95">{h.specialty}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200 ring-1 ring-emerald-400/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verifikovan
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-6 pb-7 pt-6 md:px-7">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500" aria-hidden />
                  <span className="font-display text-xl font-bold tabular-nums text-brand-navy">
                    {h.rating} / 5
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {h.reviews} {h.reviewsLabel}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Brz odgovor
                </span>
                <span className="rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Iskustvo 8+ godina
                </span>
              </div>

              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-600">{h.blurb}</p>

              <Link
                href={h.profileHref}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-[15px] font-bold text-brand-navy shadow-[0_10px_28px_-6px_rgba(245,158,11,0.45)] transition hover:brightness-105 active:scale-[0.99]"
              >
                Pogledaj profil
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/request/create"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-bold text-brand-navy underline decoration-slate-300 underline-offset-4 transition hover:decoration-amber-500"
              >
                <Send className="h-4 w-4" />
                Pošalji zahtjev
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
