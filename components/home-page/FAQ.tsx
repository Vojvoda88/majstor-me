"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mt-12 md:mt-16">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Često postavljana pitanja</h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full min-h-[56px] items-center justify-between px-4 py-4 text-left font-semibold text-[#0F172A]"
              >
                {faq.q}
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="border-t border-[#E2E8F0] px-4 py-4 text-[15px] text-[#475569]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
