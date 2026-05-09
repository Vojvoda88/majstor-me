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
  const [status, setStatus] = useState(() => sp.get("status") ?? "");
  const [adminStatus, setAdminStatus] = useState(() => sp.get("adminStatus") ?? "");
  const [sort, setSort] = useState(() => sp.get("sort") ?? "createdAt_desc");

  useEffect(() => {
    if (!searchParams) return;
    setSearch(searchParams.get("search") ?? "");
    setCity(searchParams.get("city") ?? "");
    setCategory(searchParams.get("category") ?? "");
    setStatus(searchParams.get("status") ?? "");
    setAdminStatus(searchParams.get("adminStatus") ?? "");
    setSort(searchParams.get("sort") ?? "createdAt_desc");
  }, [searchParams]);

  const apply = useCallback(() => {
    const params = new URLSearchParams(sp.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    if (city) params.set("city", city);
    else params.delete("city");
    if (category) params.set("category", category);
    else params.delete("category");
    if (status) params.set("status", status);
    else params.delete("status");
    if (adminStatus) params.set("adminStatus", adminStatus);
    else params.delete("adminStatus");
    if (sort && sort !== "createdAt_desc") params.set("sort", sort);
    else params.delete("sort");
    // Uvijek resetuj listu na prvu stranu kad se filteri/sort promijene.
    params.delete("page");
    router.push(`/admin/requests?${params.toString()}`);
  }, [search, city, category, status, adminStatus, sort, router, sp]);

  const clear = useCallback(() => {
    router.push("/admin/requests");
  }, [router]);

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
          {REQUEST_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-sm"
        >
          <option value="">Svi</option>
          <option value="OPEN">Otvoren</option>
          <option value="IN_PROGRESS">U toku</option>
          <option value="COMPLETED">Završen</option>
          <option value="CANCELLED">Otkazan</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Admin status</label>
        <select
          value={adminStatus}
          onChange={(e) => setAdminStatus(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-sm"
        >
          <option value="">Svi</option>
          <option value="PENDING_REVIEW">Na čekanju</option>
          <option value="DISTRIBUTED">Distribuiran</option>
          <option value="HAS_OFFERS">Ima ponude</option>
          <option value="CONTACT_UNLOCKED">Kontakt otključan</option>
          <option value="CLOSED">Zatvoren</option>
          <option value="SPAM">Spam</option>
          <option value="DELETED">Obrisan</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-[#64748B]">Sortiranje</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-sm"
        >
          <option value="createdAt_desc">Najnoviji prvo</option>
          <option value="createdAt_asc">Najstariji prvo</option>
        </select>
      </div>
      <Button size="sm" onClick={apply}>Filtriraj</Button>
      <Button size="sm" variant="outline" onClick={clear}>Reset</Button>
    </div>
  );
}
