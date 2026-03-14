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
      <div className="mx-auto flex max-w-4xl flex-col gap-2 rounded-lg bg-white p-2 shadow-2xl md:flex-row">
        <div className="relative flex-1">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded bg-transparent p-4 text-left text-sm text-gray-700 outline-none"
            aria-label="Odaberi grad"
          >
            <option value="">Svi gradovi</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="relative flex-1 border-t border-gray-100 md:border-t-0 md:border-l md:border-gray-100">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full cursor-pointer appearance-none rounded bg-transparent p-4 text-left text-sm text-gray-700 outline-none"
            aria-label="Odaberi kategoriju"
          >
            <option value="">Odaberi kategoriju</option>
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.internalCategory}>
                {cat.displayName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          className="whitespace-nowrap rounded bg-[#2563EB] px-10 py-4 font-bold text-white transition hover:bg-[#1D4ED8]"
        >
          Objavi zahtjev
        </button>
      </div>
    </form>
  );
}
