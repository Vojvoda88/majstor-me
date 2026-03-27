"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Wrench, ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { cityLocative } from "@/lib/slugs";
import { buildSeoCombinedIntroParagraph, type SeoCombinedParsed } from "@/lib/seo-landing-copy";
import { getPrioritySeoLandingContent } from "@/lib/seo-landing-priority-copy";
import type { PublicHandymenListResult } from "@/lib/handymen-listing";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

export function SeoLandingContent({
  slug,
  displayName,
  internalCategory,
  cityName,
  citySlug,
  categorySlug,
  initialListing,
}: {
  slug: string;
  displayName: string;
  internalCategory: string;
  cityName: string;
  citySlug: string;
  categorySlug: string;
  initialListing: PublicHandymenListResult | null;
}) {
  const [handymen, setHandymen] = useState<Handyman[]>(initialListing?.items ?? []);
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialListing?.totalPages ?? 1);
  const [total, setTotal] = useState(initialListing?.total ?? 0);
  const [loading, setLoading] = useState(!initialListing);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const cityNameLocative = cityLocative(cityName);
  const parsed: SeoCombinedParsed = {
    categorySlug,
    citySlug,
    categoryDisplayName: displayName,
    cityDisplayName: cityName,
    internalCategory,
  };
  const priority = getPrioritySeoLandingContent(slug);
  const intro = priority?.intro ?? buildSeoCombinedIntroParagraph(parsed);

  const skipFirstClientFetch = useRef(!!initialListing);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityName, sortBy]);

  useEffect(() => {
    let cancelled = false;
    if (skipFirstClientFetch.current && page === 1 && reloadToken === 0 && sortBy === "rating") {
      skipFirstClientFetch.current = false;
      return;
    }

    async function fetchHandymen() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("category", internalCategory);
        params.set("city", cityName);
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
        console.error("Greška pri učitavanju majstora za SEO landing:", e);
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
  }, [internalCategory, cityName, sortBy, page, reloadToken]);

  const createUrl = `/request/create?category=${encodeURIComponent(internalCategory)}&city=${encodeURIComponent(cityName)}`;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <PublicHeader />

        <div className="py-8">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-700">
              Početna
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/grad/${citySlug}`} className="hover:text-slate-700">
              {cityName}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900">{displayName}</span>
          </nav>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Usluga u gradu</p>
          <h1 className="mb-5 mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
            {displayName} u {cityNameLocative}
          </h1>

          <p className="mb-4 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-[1.05rem]">{intro}</p>

          <p className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
            <Link
              href={`/category/${categorySlug}`}
              className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
            >
              {displayName} — cijela Crna Gora
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <Link
              href={`/grad/${citySlug}`}
              className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
            >
              Sve usluge u {cityName}
            </Link>
            {priority && (
              <>
                <span className="hidden text-slate-300 sm:inline" aria-hidden>
                  |
                </span>
                <Link
                  href={createUrl}
                  className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  Zahtjev za {displayName.toLowerCase()} u {cityName}
                </Link>
              </>
            )}
          </p>

          <div className="mb-6 flex flex-wrap gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rating" | "reviews")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <option value="rating">Sortiraj po ocjeni</option>
              <option value="reviews">Sortiraj po broju recenzija</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-slate-500 shadow-sm">
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-12 text-center shadow-sm">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => setReloadToken((t) => t + 1)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98]"
              >
                Pokušaj ponovo
              </button>
            </div>
          ) : handymen.length === 0 ? (
            <div className="rounded-2xl border border-white bg-white p-12 text-center shadow-sm">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
                Trenutno nema {displayName.toLowerCase()}a u {cityNameLocative}.
              </p>
              <Link
                href={createUrl}
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Objavi zahtjev
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {total} majstor(a) u {cityNameLocative}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {handymen.map((h) => (
                  <HandymanCard key={h.id} {...h} variant="compact" />
                ))}
              </div>
              {totalPages > 1 && (
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

          {/* CTA */}
          <section className="mt-12 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Pošaljite zahtjev</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Jedan opis posla, jedan grad — majstori koji mogu da odgovore šalju ponude. Nema obaveze da prihvatite.
            </p>
            <Link
              href={createUrl}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 py-3.5 text-base font-bold text-white shadow-btn-cta transition hover:brightness-105"
            >
              Objavi zahtjev
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>

          <section className="mt-10 rounded-2xl border border-white bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Često postavljana pitanja</h2>
            <div className="space-y-5 text-sm leading-relaxed text-slate-600">
              {(priority?.faq ?? [
                {
                  q: `Koliko košta ${displayName.toLowerCase()} u ${cityNameLocative}?`,
                  a: "Cijena zavisi od vrste posla i materijala. Na BrziMajstor.ME možete dobiti više ponuda pa uporediti prije angažmana.",
                },
                {
                  q: "Kada mogu očekivati odgovor?",
                  a: "Zavisi od dostupnosti majstora. U zahtjevu navedite kada vam odgovara dolazak — majstori odgovaraju kad mogu.",
                },
                {
                  q: "Šta vidim na profilu majstora?",
                  a: "Ocjene i broj recenzija od ranijih korisnika, kad postoje. Na profilu možete vidjeti i kategorije koje majstor nudi.",
                },
              ]).map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-slate-800">{item.q}</h3>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
