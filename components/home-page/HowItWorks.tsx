"use client";

import Link from "next/link";
import { FileText, MessageSquare, CheckCircle, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Objavite zahtjev",
    desc: "Opišite posao i grad. Jasno i detaljno.",
    cta: "Objavite zahtjev",
    href: "/request/create",
  },
  {
    icon: MessageSquare,
    title: "Primite ponude",
    desc: "Majstori vam šalju direktne ponude za vaš zahtjev.",
    cta: null,
    href: "/request/create",
  },
  {
    icon: CheckCircle,
    title: "Izaberite majstora",
    desc: "Uporedite ocjene, cijene i izaberite najbolju ponudu.",
    cta: null,
    href: "/category/vodoinstalater",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="mt-16 mb-20 rounded-3xl bg-white py-16 shadow-soft md:mt-20 md:mb-24 md:py-20">
      <div className="mb-12 md:mb-14">
        <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Kako funkcioniše
        </h2>
        <p className="mt-2 max-w-xl text-slate-500">
          Tri jednostavna koraka do provjerenog majstora
        </p>
      </div>

      {/* Desktop: 3 columns with horizontal arrows */}
      <div className="hidden md:flex md:items-stretch md:gap-0">
        {steps.map(({ icon: Icon, title, desc, cta, href }, idx) => (
          <div key={title} className="flex flex-1 items-stretch">
            <Link
              href={href}
              className="group relative flex min-h-[180px] w-full flex-col rounded-2xl border border-slate-100 bg-slate-50/40 p-6 transition-all duration-300 hover:-translate-y-[6px] hover:border-blue-200 hover:bg-white hover:shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] hover:shadow-blue-500/10"
            >
              {/* Step number badge above icon */}
              <span className="absolute -top-2.5 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-bold text-white shadow-md">
                {idx + 1}
              </span>
              {/* Icon in 48px light circle */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1d4ed8] transition-colors group-hover:bg-blue-200/80">
                <Icon className="h-12 w-12 shrink-0" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              <div className="mt-auto pt-4">
                {cta ? (
                  <span className="inline-flex items-center rounded-xl bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#1e40af]">
                    {cta}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-[#1d4ed8] opacity-0 transition group-hover:opacity-100">
                    Saznaj više →
                  </span>
                )}
              </div>
            </Link>
            {idx < steps.length - 1 && (
              <div className="flex shrink-0 items-center px-2">
                <ArrowRight className="h-6 w-6 text-slate-300" aria-hidden />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical flow with down arrows */}
      <div className="flex flex-col gap-0 md:hidden">
        {steps.map(({ icon: Icon, title, desc, cta, href }, idx) => (
          <div key={title} className="flex flex-col items-center">
            <Link
              href={href}
              className="group relative flex min-h-[180px] w-full flex-col rounded-2xl border border-slate-100 bg-slate-50/40 p-6 transition-all duration-300 active:border-blue-200 active:bg-white active:shadow-[0_20px_40px_-12px_rgba(15,23,42,0.15)]"
            >
              <span className="absolute -top-2.5 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-bold text-white shadow-md">
                {idx + 1}
              </span>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1d4ed8]">
                <Icon className="h-12 w-12" strokeWidth={1.75} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
              <div className="mt-auto pt-4">
                {cta ? (
                  <span className="inline-flex items-center rounded-xl bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white">
                    {cta}
                  </span>
                ) : null}
              </div>
            </Link>
            {idx < steps.length - 1 && (
              <div className="flex shrink-0 py-2">
                <ArrowDown className="h-6 w-6 text-slate-300" aria-hidden />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
