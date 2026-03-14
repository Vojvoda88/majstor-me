import Link from "next/link";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Sve kategorije | Majstor.me",
  description: "Pregledajte sve kategorije usluga — vodoinstalater, električar, keramičar i više. Pronađite majstora za svaki posao.",
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-28 pt-16">
      <PremiumMobileHeader />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display mb-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Sve kategorije
        </h1>
        <p className="mb-12 text-slate-500">
          {CATEGORY_CONFIG.length} kategorija — pronađite majstora za svaki posao
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CONFIG.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-soft transition hover:border-slate-200 hover:shadow-card"
              >
                <span className="font-medium text-slate-800">{cat.displayName}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
