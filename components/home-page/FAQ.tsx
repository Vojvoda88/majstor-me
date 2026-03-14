"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-10 sm:py-14 lg:py-16">
      <h2 className="mb-4 text-center text-2xl font-semibold text-gray-900 sm:mb-6 sm:text-3xl">
        Često postavljana pitanja
      </h2>

      <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
        {FAQ_ITEMS.map((faq, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-md"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full min-h-[56px] items-center justify-between px-4 py-4 text-left font-semibold text-gray-900 sm:px-6"
            >
              {faq.q}
              <ChevronDown
                className={`h-5 w-5 shrink-0 transition ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && (
              <div className="border-t border-gray-100 px-6 py-4 text-gray-600">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
