"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-page/home-header";
import { Wrench, MapPin, List, ChevronLeft, ChevronRight } from "lucide-react";
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
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <HomeHeader />

        <div className="py-8">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-700">
              Početna
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900">{displayName}</span>
          </nav>

          <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {displayName}
          </h1>

          <div className="mb-4 flex flex-wrap gap-2">
            {HOMEPAGE_CITIES.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                href={`/${slug}-${c.slug}`}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <option value="">Svi gradovi</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rating" | "reviews")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <option value="rating">Sortiraj po ocjeni</option>
              <option value="reviews">Sortiraj po broju recenzija</option>
            </select>
            <div className="ml-auto flex rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <List className="h-4 w-4" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  viewMode === "map" ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Mapa
              </button>
            </div>
          </div>

          {loading ? (
            <p className="py-12 text-center text-slate-500">Učitavanje...</p>
          ) : handymen.length === 0 ? (
            <div className="rounded-2xl border border-white bg-white p-12 text-center shadow-sm">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
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
              <div className="mb-4 text-sm text-slate-500">
                {total} majstor(a)
              </div>
              {viewMode === "map" ? (
                <HandymanMapView
                  handymen={handymen}
                  city={cityFilter || undefined}
                  className="mb-6"
                />
              ) : null}
              {viewMode === "list" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {handymen.map((h) => (
                    <HandymanCard key={h.id} {...h} variant="compact" />
                  ))}
                </div>
              )}
              {viewMode === "list" && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 text-sm text-slate-600">
                    Strana {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
