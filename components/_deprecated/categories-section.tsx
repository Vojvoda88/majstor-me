import Link from "next/link";
import { Droplets, Zap, Wind, Truck, Sofa, Sparkles, Package, Paintbrush } from "lucide-react";
import { REQUEST_CATEGORIES } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Vodoinstalater": Droplets,
  "Električar": Zap,
  "Klima servis": Wind,
  "Moler / sitne kućne popravke": Paintbrush,
  "Montaža namještaja": Sofa,
  "Čišćenje": Sparkles,
  "Selidbe": Truck,
};

export function CategoriesSection() {
  return (
    <section id="kategorije" className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-[#0F172A] mb-8">
          Popularne kategorije
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {REQUEST_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category] ?? Package;
            return (
              <Link
                key={category}
                href={`/request/create?category=${encodeURIComponent(category)}`}
                className="flex items-center gap-2 px-5 py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-full transition-colors"
              >
                <Icon className="w-5 h-5 text-[#2563EB]" />
                <span className="text-[#0F172A] font-medium">{category}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
