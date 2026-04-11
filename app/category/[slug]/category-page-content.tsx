"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";
import { MobileFilterSheet } from "@/components/category/MobileFilterSheet";
import { CategoryHandymanCard } from "@/components/lists/CategoryHandymanCard";
import { HandymanMapView } from "@/components/map/handyman-map-view";
import { LandingValueBlock } from "@/components/landing/landing-value-block";
import { Wrench, MapPin, List, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { CITIES, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { cityToSlug, phraseUGradu } from "@/lib/slugs";
import type { PublicHandymenListResult } from "@/lib/handymen-listing";

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
  initialCity,
  initialListing,
}: {
  displayName: string;
  internalCategory: string;
  slug: string;
  /** Grad iz ?city= prosleđen sa servera – izbjegava useSearchParams + Suspense zaglavljivanje */
  initialCity: string;
  /** Prva stranica sa servera — puni prvi render prije klijentskog fetch-a */
  initialListing: PublicHandymenListResult | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [handymen, setHandymen] = useState<Handyman[]>(initialListing?.items ?? []);
  const [cityFilter, setCityFilter] = useState<string>(initialCity);
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialListing?.totalPages ?? 1);
  const [total, setTotal] = useState(initialListing?.total ?? 0);
  const [loading, setLoading] = useState(!initialListing);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const loadGenRef = useRef(0);
  const skipFirstClientFetch = useRef(!!initialListing);

  const setCityFilterAndUrl = useCallback(
    (next: string) => {
      setCityFilter(next);
      const params = new URLSearchParams();
      if (next) params.set("city", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    setCityFilter(initialCity);
  }, [initialCity]);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityFilter, sortBy]);

  useEffect(() => {
    if (skipFirstClientFetch.current && page === 1 && reloadToken === 0 && sortBy === "rating") {
      skipFirstClientFetch.current = false;
      return;
    }

    const gen = ++loadGenRef.current;
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

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
        const res = await fetch(`/api/handymen?${params}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load handymen: ${res.status}`);
        }
        const data = await res.json();
        const items = data.items ?? data.handymen ?? [];
        if (cancelled || gen !== loadGenRef.current) return;
        setHandymen(items);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? items.length);
      } catch (e) {
        if (cancelled || gen !== loadGenRef.current) return;
        if ((e as DOMException).name === "AbortError") {
          console.warn("Učitavanje majstora za kategoriju je isteklo (timeout).");
          setError("Učitavanje traje duže nego obično. Pokušajte ponovo.");
        } else {
          console.error("Greška pri učitavanju majstora za kategoriju:", e);
          setError("Došlo je do greške pri učitavanju majstora. Pokušajte ponovo.");
        }
        setHandymen([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled && gen === loadGenRef.current) {
          setLoading(false);
        }
      }
    }

    fetchHandymen();

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [internalCategory, cityFilter, sortBy, page, reloadToken, initialCity]);

  const sortLabel = sortBy === "rating" ? "Po ocjeni" : "Po broju recenzija";

  return (
    <main className="min-h-screen bg-brand-page pb-28 text-brand-navy md:pb-10">
      <PublicHeader />

      <div className="mx-auto max-w-[430px] px-4 md:max-w-4xl md:px-6 lg:max-w-[1400px] lg:px-8">
        <div className="py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="font-medium transition hover:text-blue-700">
              Početna
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <Link href="/categories" className="font-medium transition hover:text-blue-700">
              Kategorije
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-brand-navy">{displayName}</span>
          </nav>

          {/* Header zone — fokus: jedna usluga, više gradova */}
          <header className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Kategorija</p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-brand-navy md:text-5xl">
              {displayName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Jedna vrsta usluge, cijela Crna Gora — birajte grad filterom ili mapom, uporedite ocjene ili pošaljite{" "}
              <span className="font-medium text-[#0F172A]">jedan besplatan zahtjev</span> ako želite ponude od više
              majstora.
              {cityFilter ? (
                <>
                  {" "}
                  Trenutno:{" "}
                  <span className="font-medium text-[#0F172A]">{cityFilter}</span>. Za sve usluge u tom gradu, otvorite{" "}
                  <Link
                    href={`/grad/${cityToSlug(cityFilter)}`}
                    className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                  >
                    stranicu grada
                  </Link>
                  .
                </>
              ) : null}
            </p>
            <p className="mt-4 text-sm text-slate-600">
              <Link
                href={`/request/create?category=${encodeURIComponent(internalCategory)}`}
                className="font-semibold text-blue-700 underline-offset-2 hover:underline"
              >
                Zahtjev za ovu vrstu posla
              </Link>
              <span className="mx-2 text-slate-300" aria-hidden>
                ·
              </span>
              <Link href="/categories" className="font-medium text-slate-600 hover:text-blue-700 hover:underline">
                Sve kategorije
              </Link>
            </p>
          </header>

          {/* Toolbar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-marketplace-sm lg:mb-10 lg:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-[15px] font-semibold text-brand-navy">
                {cityFilter || "Svi gradovi"}
              </span>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(true)}
                className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-[15px] font-semibold text-brand-navy shadow-sm transition hover:bg-slate-50 active:scale-[0.98] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filteri
              </button>
              <span className="hidden h-12 items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-[15px] font-medium text-slate-700 lg:flex">
                Sortiraj: {sortLabel}
              </span>
            </div>

            {/* Lista / Mapa segmented control */}
            <div className="flex h-12 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-[15px] font-semibold transition ${
                  viewMode === "list"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                <List className="h-4 w-4" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-[15px] font-semibold transition ${
                  viewMode === "map"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:bg-white/60"
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
                <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 text-sm text-slate-600 shadow-sm">
                  <div className="mb-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ) : error ? (
                <div className="overflow-hidden rounded-3xl border border-red-200/80 bg-gradient-to-br from-red-50 to-white p-10 text-center shadow-marketplace-sm">
                  <p className="text-base font-semibold text-red-900">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadToken((t) => t + 1)}
                    className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-8 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    Pokušaj ponovo
                  </button>
                </div>
              ) : handymen.length === 0 ? (
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-marketplace-sm md:p-14">
                  <Wrench className="mx-auto mb-5 h-14 w-14 text-slate-300" />
                  <p className="text-lg font-semibold text-brand-navy">
                    Trenutno nema aktivnih majstora za ovu kategoriju{cityFilter ? ` ${phraseUGradu(cityFilter)}` : ""}.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Pošaljite jedan zahtjev i nakon kratkog pregleda dobijate ponude majstora koji pokrivaju ovaj posao.
                  </p>
                  <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={`/request/create?category=${encodeURIComponent(internalCategory)}${cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ""}`}
                      className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-10 text-base font-bold text-white shadow-btn-cta transition hover:brightness-105"
                    >
                      Objavi besplatan zahtjev
                    </Link>
                    {cityFilter ? (
                      <Link
                        href={`/grad/${cityToSlug(cityFilter)}`}
                        className="inline-flex h-14 min-h-[52px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Pogledaj sve usluge {phraseUGradu(cityFilter)}
                      </Link>
                    ) : null}
                  </div>
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
              <div className="sticky top-24 space-y-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 shadow-marketplace-sm">
                <div>
                  <label className="mb-3 block text-[18px] font-semibold text-[#0F172A]">
                    Grad
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilterAndUrl(e.target.value)}
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

      <PublicFooter />
      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
      <MobileFilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        cityFilter={cityFilter}
        onCityChange={setCityFilterAndUrl}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        slug={slug}
      />
    </main>
  );
}
