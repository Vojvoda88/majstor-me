"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Wrench, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

export function SeoLandingContent({
  displayName,
  internalCategory,
  cityName,
  citySlug,
}: {
  displayName: string;
  internalCategory: string;
  cityName: string;
  citySlug: string;
}) {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityName, sortBy]);

  useEffect(() => {
    async function fetchHandymen() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("category", internalCategory);
      params.set("city", cityName);
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
  }, [internalCategory, cityName, sortBy, page]);

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

          <h1 className="mb-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {displayName} {cityName}
          </h1>
          <p className="mb-6 text-slate-600">
            Pronađite provjerene {displayName.toLowerCase()}e u {cityName}. Brze ponude, lako usporedite majstore.
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
            <p className="py-12 text-center text-slate-500">Učitavanje...</p>
          ) : handymen.length === 0 ? (
            <div className="rounded-2xl border border-white bg-white p-12 text-center shadow-sm">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
                Trenutno nema {displayName.toLowerCase()}a u {cityName}.
              </p>
              <Link
                href={`/request/create?category=${encodeURIComponent(internalCategory)}&city=${encodeURIComponent(cityName)}`}
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Objavi zahtjev
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {total} majstor(a) u {cityName}
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

          {/* FAQ sekcija za SEO */}
          <section className="mt-12 rounded-2xl border border-white bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Često postavljana pitanja
            </h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800">Kako pronaći {displayName.toLowerCase()}a u {cityName}?</h3>
                <p>
                  Pregledajte listu majstora iznad, uporedite ocjene i recenzije, te pošaljite zahtjev onome koji vam najviše odgovara. Odmah ćete dobiti ponude.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Koliko košta {displayName.toLowerCase()} u {cityName}?</h3>
                <p>
                  Cijene variraju ovisno o obimu posla. Pošaljite zahtjev i dobićete konkretne ponude od majstora iz {cityName} i okolice.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Da li su majstori provjereni?</h3>
                <p>
                  Majstori na Majstor.me imaju recenzije od stvarnih korisnika. Verifikovani majstori imaju dodatnu provjeru.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
