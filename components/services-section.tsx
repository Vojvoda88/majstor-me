import Link from "next/link";
import { Droplets, Zap, Wind, Paintbrush, Sofa, Sparkles, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { REQUEST_CATEGORIES } from "@/lib/constants";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Vodoinstalater": Droplets,
  "Električar": Zap,
  "Klima servis": Wind,
  "Moler / sitne kućne popravke": Paintbrush,
  "Montaža namještaja": Sofa,
  "Čišćenje": Sparkles,
  "Selidbe": Package,
};

export function ServicesSection() {
  return (
    <section id="usluge" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0F172A] mb-4">
          Popularne usluge
        </h2>
        <p className="text-center text-[#64748B] mb-8">
          Brzi pristup najtraženijim vrstama poslova
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scrollbar-hide">
          {REQUEST_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? Package;
            return (
              <Link
                key={cat}
                href={`/request/create?category=${encodeURIComponent(cat)}`}
                className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card transition-all hover:border-[#2563EB]/30 hover:shadow-card-hover flex-shrink-0 w-[280px] sm:w-auto"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-[#1E293B] group-hover:text-[#2563EB]">{cat}</span>
                <span className="ml-auto text-[#94A3B8] opacity-0 group-hover:opacity-100">→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
