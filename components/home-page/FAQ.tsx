"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24">
      <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Često postavljana pitanja
      </h2>
      <p className="mb-14 max-w-xl text-slate-500">
        Odgovori na najčešća pitanja o platformi
      </p>
      <div className="space-y-4">
        {FAQ_ITEMS.map((faq, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:border-slate-200"
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between p-6 text-left"
            >
              <span className="pr-4 text-[16px] font-semibold text-slate-800">{faq.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition duration-200 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {open === i && (
              <div className="border-t border-slate-100 px-6 py-5 text-[15px] leading-relaxed text-slate-600">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
