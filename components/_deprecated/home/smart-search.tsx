"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REQUEST_CATEGORIES, CITIES } from "@/lib/constants";

export function SmartSearch() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("Podgorica");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    router.push(`/request/create${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Šta vam treba?"
          className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-4 text-[15px] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          readOnly
          onClick={() => router.push("/request/create")}
        />
      </div>
      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="h-12 rounded-xl border border-[#E2E8F0] bg-white px-4 text-[15px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
      >
        {CITIES.slice(0, 12).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-12 rounded-xl border border-[#E2E8F0] bg-white px-4 text-[15px] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
      >
        <option value="">Kategorija</option>
        {REQUEST_CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <Button type="submit" size="lg" className="h-12 shrink-0 px-6">
        Pretraži
      </Button>
    </form>
  );
}
