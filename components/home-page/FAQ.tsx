"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-12 md:scroll-mt-24 md:py-32">
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 px-4 py-6 shadow-sm sm:px-5 sm:py-7 md:mb-14 md:rounded-3xl md:px-10 md:py-11">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-800">PODRŠKA</p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">
          Često postavljana pitanja
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-700 sm:mt-4 sm:text-base">
          Brzi odgovori prije nego što objavite zahtjev ili se registrujete kao majstor.
        </p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {FAQ_ITEMS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={faq.q}
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                isOpen
                  ? "border-slate-300/90 bg-white shadow-[0_12px_40px_-16px_rgba(10,22,40,0.15)] ring-1 ring-slate-200/60"
                  : "border-slate-200/70 bg-white/90 hover:border-slate-300/80"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-[52px] w-full touch-manipulation cursor-pointer items-start gap-4 px-4 py-4 text-left md:items-center md:px-7 md:py-6"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white md:mt-0">
                  {i + 1}
                </span>
                <span className="flex-1 pr-2 font-display text-[16px] font-bold leading-snug text-brand-navy md:text-[17px]">
                  {faq.q}
                </span>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isOpen
                      ? "border-amber-200/80 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <ChevronDown className={`h-4 w-4 transition duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-5 pl-[4.5rem] text-[15px] leading-relaxed text-slate-700 md:px-7 md:py-6 md:pl-[5.25rem] md:text-[16px]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
