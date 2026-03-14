"use client";

import Link from "next/link";
import { Wrench, Zap, Grid3X3, Thermometer, Truck, Sparkles } from "lucide-react";

const TOP_CATEGORIES = [
  { slug: "vodoinstalater", name: "Vodoinstalater", icon: Wrench },
  { slug: "elektricar", name: "Električar", icon: Zap },
  { slug: "keramicar", name: "Keramičar", icon: Grid3X3 },
  { slug: "klima-servis", name: "Klima servis", icon: Thermometer },
  { slug: "selidbe", name: "Selidbe", icon: Truck },
  { slug: "ciscenje", name: "Čišćenje", icon: Sparkles },
];

export function CategoriesGrid() {
  return (
    <section id="kategorije" className="mt-7 md:mt-10">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <h2 className="mb-3 text-xl font-bold text-[#0F172A]">Top kategorije</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {TOP_CATEGORIES.map(({ slug, name, icon: Icon }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="flex min-h-[92px] items-center gap-3 rounded-[18px] border border-[#E6EDF5] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#60A5FA]/20 to-[#2563EB]/15">
                <Icon className="h-[22px] w-[22px] text-[#2563EB]" />
              </div>
              <span className="text-[15px] font-semibold text-[#0F172A]">{name}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/category/vodoinstalater"
          className="mt-4 flex min-h-[48px] items-center justify-center rounded-[14px] border border-[#D6E2F1] bg-white text-[15px] font-medium text-[#475569] shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
        >
          Vidi još kategorija
        </Link>
      </div>
    </section>
  );
}
