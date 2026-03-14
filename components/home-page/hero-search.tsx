"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
    <form onSubmit={handleSubmit}>
      <div className="mx-auto flex max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl bg-white p-2 shadow-premium-lg md:flex-row md:gap-0">
        <div className="relative flex-1 rounded-xl bg-slate-50">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full cursor-pointer appearance-none bg-transparent py-4 pl-5 pr-12 text-left text-[15px] font-medium text-slate-700 outline-none transition hover:bg-slate-100/80"
            aria-label="Odaberi grad"
          >
            <option value="">Svi gradovi</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <div className="relative flex-1 rounded-xl bg-slate-50 md:ml-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full cursor-pointer appearance-none bg-transparent py-4 pl-5 pr-12 text-left text-[15px] font-medium text-slate-700 outline-none transition hover:bg-slate-100/80"
            aria-label="Odaberi kategoriju"
          >
            <option value="">Odaberi kategoriju</option>
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.internalCategory}>
                {cat.displayName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#1d4ed8] px-10 py-4 text-[15px] font-bold text-white transition hover:bg-[#1e40af] hover:shadow-glow active:scale-[0.98]"
        >
          Objavi zahtjev
        </button>
      </div>
    </form>
  );
}
