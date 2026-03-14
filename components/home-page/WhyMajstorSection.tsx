"use client";

import { ShieldCheck, Zap, CreditCard } from "lucide-react";

const ITEMS = [
  {
    icon: CreditCard,
    title: "Besplatno objavljivanje",
    desc: "Nema troškova za objavljivanje zahtjeva. Plaćate samo kada izaberete majstora.",
  },
  {
    icon: ShieldCheck,
    title: "Provjereni majstori",
    desc: "Majstori su verifikovani. Pregledajte ocjene i recenzije prije odabira.",
  },
  {
    icon: Zap,
    title: "Brze ponude",
    desc: "Primajte ponude direktno od majstora. Bez spam poziva, bez obaveze.",
  },
];

export function WhyMajstorSection() {
  return (
    <section className="py-20">
      <h2 className="font-display mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        Zašto Majstor.me?
      </h2>
      <p className="mb-14 max-w-xl text-slate-500">
        Jednostavno. Transparentno. Bez skrivenih troškova.
      </p>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-soft transition duration-300 hover:border-slate-200 hover:shadow-card"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1d4ed8]">
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-[15px] leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-6 py-4 text-emerald-800">
        <ShieldCheck className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold">Zadovoljstvo garantovano</span>
      </div>
    </section>
  );
}
