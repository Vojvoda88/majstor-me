"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-page/home-header";
import { MobileStickyCTA } from "@/components/home-page/MobileStickyCTA";
import { MobileFilterSheet } from "@/components/category/MobileFilterSheet";
import { Wrench, MapPin, List, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { HandymanMapView } from "@/components/map/handyman-map-view";
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

  useEffect(() => {
    setCityFilter(cityFromUrl);
  }, [cityFromUrl]);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityFilter, sortBy]);

  useEffect(() => {
    async function fetchHandymen() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("category", internalCategory);
      if (cityFilter) params.set("city", cityFilter);
      params.set("sort", sortBy);
      params.set("page", String(page));
      params.set("limit", String(DEFAULT_PAGE_SIZE));
      const res = await fetch(`/api/handymen?${params}`);
      const data = await res.json();
      const items = data.items ?? data.handymen ?? [];
      setHandymen(items);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? items.length);
      setLoading(false);
    }
    fetchHandymen();
  }, [internalCategory, cityFilter, sortBy, page]);

  return (
    <main className="min-h-screen bg-[#F4F7FB] pb-28 text-[#0F172A] md:pb-10">
      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6">
        <HomeHeader />

        <div className="py-6 sm:py-10 lg:py-16">
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Početna
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">{displayName}</span>
          </nav>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {displayName}
            </h1>
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              className="flex min-h-[48px] items-center gap-2 rounded-[14px] border border-[#D6E2F1] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition active:scale-[0.98] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filteri
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
            <aside className="hidden space-y-5 rounded-xl bg-white p-5 shadow-sm sm:p-6 lg:order-2 lg:block">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Grad</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                >
                  <option value="">Svi gradovi</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Sortiraj</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rating" | "reviews")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                >
                  <option value="rating">Po ocjeni</option>
                  <option value="reviews">Po broju recenzija</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Prikaz</label>
                <div className="flex min-h-[48px] rounded-xl border border-gray-200 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <List className="h-5 w-5" />
                    Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    Mapa
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Brzi linkovi</p>
                <div className="flex flex-wrap gap-2">
                  {HOMEPAGE_CITIES.slice(0, 6).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${slug}-${c.slug}`}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3 lg:order-1">
              {loading ? (
                <p className="py-12 text-center text-gray-500">Učitavanje...</p>
              ) : handymen.length === 0 ? (
                <div className="rounded-[20px] border border-[#E7EDF5] bg-white p-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                  <Wrench className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-600">
                    Nema majstora za ovu kategoriju u izabranom gradu.
                  </p>
                  <Link
                    href={`/request/create?category=${encodeURIComponent(internalCategory)}${cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ""}`}
                    className="mt-4 inline-block font-medium text-blue-600 hover:underline"
                  >
                    Objavi zahtjev
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-500">
                    {total} majstor(a)
                  </div>
                  {viewMode === "map" ? (
                    <HandymanMapView
                      handymen={handymen}
                      city={cityFilter || undefined}
                      className="mb-6 rounded-xl"
                    />
                  ) : (
                    <div className="space-y-0">
                      {handymen.map((h) => (
                        <HandymanCard key={h.id} {...h} variant="list" />
                      ))}
                    </div>
                  )}
                  {viewMode === "list" && totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:shadow-md disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="px-4 text-sm text-gray-600">
                        Strana {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:shadow-md disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <MobileStickyCTA />
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
