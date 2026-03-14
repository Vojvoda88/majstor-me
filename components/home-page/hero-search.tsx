"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-md md:flex-row md:items-center md:gap-4 md:p-4">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-14 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#0F172A]"
          aria-label="Odaberi grad"
        >
          <option value="">Cijela Crna Gora</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="h-14 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#0F172A]"
          aria-label="Odaberi kategoriju"
        >
          <option value="">Odaberi kategoriju</option>
          {POPULAR_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.internalCategory}>
              {cat.displayName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-14 shrink-0 rounded-lg bg-[#2563EB] px-6 text-[16px] font-semibold text-white transition hover:bg-[#1D4ED8] md:px-8"
        >
          Objavi zahtjev
        </button>
      </div>
    </form>
  );
}
