"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/constants";
import { POPULAR_CATEGORIES } from "@/lib/categories";

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = useState("Podgorica");
  const [category, setCategory] = useState<string>(POPULAR_CATEGORIES[0]?.internalCategory ?? "Vodoinstalater");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    router.push(`/request/create?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-4 shadow-xl sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-14 min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:h-12"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-14 min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:h-12"
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.internalCategory}>
              {cat.displayName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-14 min-h-[48px] w-full shrink-0 rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] sm:h-12 sm:w-auto sm:px-8"
        >
          Objavi zahtjev
        </button>
      </div>
    </form>
  );
}
