"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="max-w-4xl py-20">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">Često postavljana pitanja</h2>
      <div className="space-y-3">
        {FAQ_ITEMS.map((faq, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:bg-gray-50"
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-gray-700">{faq.q}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && (
              <div className="border-t border-gray-100 px-5 py-4 text-gray-600">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
