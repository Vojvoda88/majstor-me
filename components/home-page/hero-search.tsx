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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-[#475569]">Grad</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-premium select-premium w-full"
        >
          <option value="">Svi gradovi</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#475569]">Kategorija</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="input-premium select-premium w-full"
        >
          <option value="">Izaberite kategoriju</option>
          {POPULAR_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.internalCategory}>
              {cat.displayName}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="btn-primary mt-1 flex w-full items-center justify-center font-semibold transition active:scale-[0.98]"
      >
        Objavi zahtjev
      </button>
    </form>
  );
}
