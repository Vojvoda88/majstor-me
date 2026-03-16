"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";
import { MobileFilterSheet } from "@/components/category/MobileFilterSheet";
import { CategoryHandymanCard } from "@/components/lists/CategoryHandymanCard";
import { HandymanMapView } from "@/components/map/handyman-map-view";
import { Wrench, MapPin, List, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { CITIES, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  verifiedStatus?: string;
  completedJobsCount?: number;
  averageResponseMinutes?: number | null;
  isPromoted?: boolean;
  lat?: number;
  lng?: number;
};

export function CategoryPageContent({
  displayName,
  internalCategory,
  slug,
}: {
  displayName: string;
  internalCategory: string;
  slug: string;
}) {
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city") ?? "";
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [cityFilter, setCityFilter] = useState<string>(cityFromUrl);
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setCityFilter(cityFromUrl);
  }, [cityFromUrl]);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityFilter, sortBy]);

  useEffect(() => {
    let cancelled = false;

    async function fetchHandymen() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("category", internalCategory);
        if (cityFilter) params.set("city", cityFilter);
        params.set("sort", sortBy);
        params.set("page", String(page));
        params.set("limit", String(DEFAULT_PAGE_SIZE));
        const res = await fetch(`/api/handymen?${params}`);
        if (!res.ok) {
          throw new Error(`Failed to load handymen: ${res.status}`);
        }
        const data = await res.json();
        const items = data.items ?? data.handymen ?? [];
        if (cancelled) return;
        setHandymen(items);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? items.length);
      } catch (e) {
        if (cancelled) return;
        console.error("Greška pri učitavanju majstora za kategoriju:", e);
        setError("Došlo je do greške pri učitavanju majstora. Pokušajte ponovo.");
        setHandymen([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHandymen();

    return () => {
      cancelled = true;
    };
  }, [internalCategory, cityFilter, sortBy, page, reloadToken]);

  const sortLabel = sortBy === "rating" ? "Po ocjeni" : "Po broju recenzija";

  return (
    <main className="min-h-screen bg-[#F3F4F6] pb-28 pt-16 text-[#0F172A] md:pb-10 md:pt-20">
      <PublicHeader />

      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6 lg:max-w-[1400px] lg:px-8">
        <div className="py-6 lg:py-10">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-[#64748B]">
            <Link href="/" className="hover:text-[#2563EB] transition">
              Početna
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-[#0F172A]">{displayName}</span>
          </nav>

          {/* Header zone */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
              {displayName} u Crnoj Gori
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#64748B] md:text-base">
              Pregled majstora za kategoriju <span className="font-medium text-[#0F172A]">{displayName.toLowerCase()}</span>
              {cityFilter ? (
                <> u gradu <span className="font-medium text-[#0F172A]">{cityFilter}</span>. Filtrirajte listu ili objavite zahtjev ako ne nalazite idealnog majstora.</>
              ) : (
                <> širom Crne Gore. Pronađite majstora ili objavite zahtjev i dobijte ponude.</>
              )}
            </p>
          </header>

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 items-center rounded-full border border-[#DCE6F2] bg-white px-5 text-[15px] font-medium text-[#0F172A] shadow-sm">
                {cityFilter || "Svi gradovi"}
              </span>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="flex h-12 items-center gap-2 rounded-full border border-[#DCE6F2] bg-white px-5 text-[15px] font-medium text-[#0F172A] shadow-sm transition active:scale-[0.98] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filteri
              </button>
              <span className="hidden h-12 items-center rounded-full border border-[#DCE6F2] bg-white px-5 text-[15px] font-medium text-[#0F172A] shadow-sm lg:flex">
                Sortiraj: {sortLabel}
              </span>
            </div>

            {/* Lista / Mapa segmented control */}
            <div className="flex h-12 overflow-hidden rounded-full border border-[#DCE6F2] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-medium transition ${
                  viewMode === "list"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#F8FAFC]"
                }`}
              >
                <List className="h-4 w-4" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-[15px] font-medium transition ${
                  viewMode === "map"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#475569] hover:bg-[#F8FAFC]"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Mapa
              </button>
            </div>
          </div>

          {/* Main content grid: list left, filter sidebar right (desktop only) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
            {/* List / Map content */}
            <div className="min-w-0">
              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white">
                  <p className="text-[#64748B]">Učitavanje...</p>
                </div>
              ) : error ? (
                <div className="overflow-hidden rounded-xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReloadToken((t) => t + 1)}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    Pokušaj ponovo
                  </button>
                </div>
              ) : handymen.length === 0 ? (
                <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
                  <Wrench className="mx-auto mb-4 h-14 w-14 text-[#94A3B8]" />
                  <p className="text-lg text-[#64748B]">
                    Nema majstora za ovu kategoriju u izabranom gradu.
                  </p>
                  <Link
                    href={`/request/create?category=${encodeURIComponent(internalCategory)}${cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ""}`}
                    className="mt-6 inline-flex h-14 items-center justify-center rounded-2xl bg-[#2563EB] px-8 text-lg font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)] transition hover:opacity-95"
                  >
                    Objavi zahtjev
                  </Link>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-sm text-[#64748B]">
                    {total} majstor(a){cityFilter ? <> u gradu {cityFilter}</> : " u Crnoj Gori"}
                  </p>

                  {viewMode === "map" ? (
                    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-md">
                      <div className="min-h-[420px]">
                        <HandymanMapView
                          handymen={handymen}
                          city={cityFilter || undefined}
                          className="h-[420px] min-h-[420px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {handymen.map((h) => (
                        <CategoryHandymanCard key={h.id} {...h} />
                      ))}
                    </div>
                  )}

                  {viewMode === "list" && totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCE6F2] bg-white text-[#0F172A] shadow-sm transition hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="px-5 text-[15px] text-[#64748B]">
                        Strana {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCE6F2] bg-white text-[#0F172A] shadow-sm transition hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Premium filter sidebar (desktop only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-7 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-7 shadow-md">
                <div>
                  <label className="mb-3 block text-[18px] font-semibold text-[#0F172A]">
                    Grad
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] px-4 text-[16px] text-[#0F172A]"
                  >
                    <option value="">Svi gradovi</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-[18px] font-semibold text-[#0F172A]">
                    Sortiraj
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "rating" | "reviews")}
                    className="h-14 w-full rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] px-4 text-[16px] text-[#0F172A]"
                  >
                    <option value="rating">Po ocjeni</option>
                    <option value="reviews">Po broju recenzija</option>
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-[18px] font-semibold text-[#0F172A]">
                    Prikaz
                  </label>
                  <div className="flex h-14 overflow-hidden rounded-2xl border border-[#DCE6F2] bg-[#F8FBFF] p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`flex flex-1 items-center justify-center gap-2 text-[15px] font-medium transition ${
                        viewMode === "list"
                          ? "rounded-xl bg-[#2563EB] text-white"
                          : "text-[#475569] hover:bg-white"
                      }`}
                    >
                      <List className="h-4 w-4" />
                      Lista
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("map")}
                      className={`flex flex-1 items-center justify-center gap-2 text-[15px] font-medium transition ${
                        viewMode === "map"
                          ? "rounded-xl bg-[#2563EB] text-white"
                          : "text-[#475569] hover:bg-white"
                      }`}
                    >
                      <MapPin className="h-4 w-4" />
                      Mapa
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-[18px] font-semibold text-[#0F172A]">
                    Brzi gradovi
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {HOMEPAGE_CITIES.slice(0, 8).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${slug}?city=${encodeURIComponent(c.name)}`}
                        className={`rounded-full border px-4 py-2.5 text-[15px] font-medium transition ${
                          cityFilter === c.name
                            ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                            : "border-[#DCE6F2] bg-[#F8FBFF] text-[#0F172A] hover:bg-white"
                        }`}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
      <MobileFilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        slug={slug}
      />
    </main>
  );
}
