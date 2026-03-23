"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CITIES, REQUEST_CATEGORIES } from "@/lib/constants";

export function RequestFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Dok router nije spreman, useSearchParams može vratiti null — .get() na null ruši render (RSC digest). */
  const sp = searchParams ?? new URLSearchParams();
  const [search, setSearch] = useState(() => sp.get("search") ?? "");
  const [city, setCity] = useState(() => sp.get("city") ?? "");
  const [category, setCategory] = useState(() => sp.get("category") ?? "");

  useEffect(() => {
    if (!searchParams) return;
    setSearch(searchParams.get("search") ?? "");
    setCity(searchParams.get("city") ?? "");
    setCategory(searchParams.get("category") ?? "");
  }, [searchParams]);

  const apply = useCallback(() => {
    const params = new URLSearchParams(sp.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    if (city) params.set("city", city);
    else params.delete("city");
    if (category) params.set("category", category);
    else params.delete("category");
    router.push(`/admin/requests?${params.toString()}`);
  }, [search, city, category, router, sp]);

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-[#E2E8F0] bg-white p-3">
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Pretraga (ime, telefon, email)</label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="..."
          className="w-48"
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Grad</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-sm"
        >
          <option value="">Svi</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Kategorija</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-sm"
        >
          <option value="">Sve</option>
          {REQUEST_CATEGORIES.slice(0, 15).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <Button size="sm" onClick={apply}>Filtriraj</Button>
    </div>
  );
}
