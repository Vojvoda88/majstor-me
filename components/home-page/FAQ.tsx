"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-10 lg:py-12">
      <h2 className="mb-6 text-center text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        Često postavljana pitanja
      </h2>

      <div className="mx-auto max-w-2xl space-y-2">
        {FAQ_ITEMS.map((faq, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-900"
            >
              {faq.q}
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <div className="border-t border-slate-100 px-6 py-4 text-slate-600">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
