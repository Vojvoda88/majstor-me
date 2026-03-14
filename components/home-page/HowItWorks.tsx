"use client";

import Link from "next/link";
import { FileText, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Objavite zahtjev",
    desc: "Opišite zahtjev sa opisom posla u vašem gradu.",
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
    desc: "Elektronski proces rješavanja hitnih popravki.",
    btn: "Vidi majstore",
    href: "/category/vodoinstalater",
  },
];

export function HowItWorks() {
  return (
    <section id="kako-radi" className="bg-white py-20">
      <h2 className="mb-12 text-2xl font-bold text-gray-900">Kako funkcioniše</h2>
      <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
        {steps.map(({ icon: Icon, title, desc, btn, href }) => (
          <div
            key={title}
            className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-8 md:items-start"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl text-[#2563EB] shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">{title}</h3>
            <p className="mb-8 text-sm leading-relaxed text-gray-500">{desc}</p>
            <Link
              href={href}
              className="w-full rounded-lg bg-[#2563EB] py-3 text-center text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
            >
              {btn}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
