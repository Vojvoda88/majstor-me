"use client";

import Link from "next/link";
import { FileText, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Objavite zahtjev",
    desc: "Opišite posao i grad. Jasno i detaljno.",
    btn: "Objavite zahtjev",
    href: "/request/create",
  },
  {
    icon: MessageSquare,
    title: "Primite ponude",
    desc: "Majstori vam šalju direktne ponude za vaš zahtjev.",
    btn: "Zatražite ponude",
    href: "/request/create",
  },
  {
    icon: CheckCircle,
    title: "Izaberite majstora",
    desc: "Uporedite ocjene, cijene i izaberite najbolju ponudu.",
    btn: "Vidi majstore",
    href: "/category/vodoinstalater",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="mt-20 mb-20 rounded-3xl bg-white py-24 shadow-soft">
      <h2 className="font-display mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Kako funkcioniše
      </h2>
      <p className="mb-16 max-w-xl text-slate-500">
        Tri jednostavna koraka do provjerenog majstora
      </p>
      <div className="grid grid-cols-1 gap-[32px] md:grid-cols-3">
        {steps.map(({ icon: Icon, title, desc, btn, href }, idx) => (
          <div
            key={title}
            className="group relative flex min-h-[220px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-md"
          >
            <div>
              <span className="absolute -top-3 left-8 bg-white px-3 py-1 text-xs font-bold text-slate-400">
                {idx + 1}
              </span>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1d4ed8] shadow-soft">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-500">{desc}</p>
            </div>
            <Link
              href={href}
              className="mt-8 flex w-full shrink-0 items-center justify-center rounded-xl bg-[#1d4ed8] py-3.5 text-[15px] font-bold text-white transition hover:bg-[#1e40af]"
            >
              {btn}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
