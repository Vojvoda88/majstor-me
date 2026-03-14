"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Layers } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { POPULAR_CATEGORIES } from "@/lib/categories";

export function MobileSearchCard() {
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-[#475569]">Grad</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="">Svi gradovi</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[#475569]">Kategorija</label>
        <div className="relative">
          <Layers className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="h-12 w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          >
            <option value="">Izaberite kategoriju</option>
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.internalCategory}>
                {cat.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-base font-semibold text-white shadow-lg transition active:scale-[0.98]"
      >
        Objavi zahtjev
      </button>
    </form>
  );
}
