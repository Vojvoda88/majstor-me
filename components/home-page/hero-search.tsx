"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { POPULAR_CATEGORIES } from "@/lib/categories";

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/request/create?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative touch-manipulation">
      <div
        className="mx-auto flex max-w-4xl flex-col gap-2 overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/95 p-2 shadow-marketplace ring-1 ring-black/5 backdrop-blur-md md:flex-row md:items-stretch md:gap-2 md:p-2.5"
        data-testid="hero-search"
      >
        <div className="relative flex-1 rounded-2xl bg-slate-50/90 ring-1 ring-slate-200/80">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="min-h-[48px] w-full cursor-pointer appearance-none rounded-2xl bg-transparent py-3.5 pl-5 pr-12 text-left text-[16px] font-semibold text-slate-800 outline-none transition hover:bg-slate-100/80 sm:py-4 sm:text-[15px]"
            aria-label="Odaberi grad"
          >
            <option value="">Svi gradovi</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <div className="relative flex-1 rounded-2xl bg-slate-50/90 ring-1 ring-slate-200/80 md:min-w-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="min-h-[48px] w-full cursor-pointer appearance-none rounded-2xl bg-transparent py-3.5 pl-5 pr-12 text-left text-[16px] font-semibold text-slate-800 outline-none transition hover:bg-slate-100/80 sm:py-4 sm:text-[15px]"
            aria-label="Odaberi kategoriju"
          >
            <option value="">Odaberi kategoriju</option>
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.internalCategory}>
                {cat.displayName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <button
          type="submit"
          className="flex min-h-[52px] w-full shrink-0 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 text-[16px] font-bold text-white shadow-btn-cta transition hover:brightness-105 active:scale-[0.98] sm:w-auto sm:text-[15px] md:px-8"
        >
          <Search className="h-5 w-5 opacity-90" aria-hidden />
          Objavi zahtjev
        </button>
      </div>
    </form>
  );
}
