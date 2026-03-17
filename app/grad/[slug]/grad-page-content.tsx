"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { POPULAR_CATEGORIES } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { cityLocative } from "@/lib/slugs";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

export function GradPageContent({
  cityName,
  slug,
  cityImage,
}: {
  cityName: string;
  slug: string;
  cityImage?: string;
}) {
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const cityNameLocative = cityLocative(cityName);

  useEffect(() => {
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
        params.set("city", cityName);
        params.set("page", String(page));
        params.set("limit", String(DEFAULT_PAGE_SIZE));
        const res = await fetch(`/api/handymen?${params}`, { signal: controller.signal });
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
        if ((e as DOMException).name === "AbortError") {
          console.warn("Učitavanje majstora za grad je isteklo (timeout).");
          setError("Učitavanje traje duže nego obično. Pokušajte ponovo.");
        } else {
          console.error("Greška pri učitavanju majstora za grad:", e);
          setError("Došlo je do greške pri učitavanju majstora. Pokušajte ponovo.");
        }
        setHandymen([]);
        setTotalPages(1);
        setTotal(0);
      } finally {
        if (!cancelled) {
          window.clearTimeout(timeoutId);
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
  }, [cityName, page, reloadToken]);

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
            <span className="font-medium text-slate-900">{cityName}</span>
          </nav>

          {cityImage && (
            <div className="relative mb-6 h-48 overflow-hidden rounded-2xl">
              <Image
                src={cityImage}
                alt={cityName}
                fill
                className="object-cover"
                sizes="1440px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
              <h1 className="absolute bottom-4 left-4 text-3xl font-black text-white">
                Majstori u {cityNameLocative}
              </h1>
            </div>
          )}

          {!cityImage && (
            <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Majstori u {cityNameLocative}
            </h1>
          )}

          <p className="mb-6 max-w-2xl text-sm text-slate-600 sm:text-base">
            Pregled provjerenih majstora koji rade u gradu <span className="font-medium text-slate-900">{cityName}</span>.
            Ako ne pronađete odgovarajućeg majstora, uvijek možete objaviti besplatan zahtjev i dobiti nove ponude.
          </p>

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Majstori u ovom gradu
          </h2>

          {loading ? (
            <p className="py-12 text-center text-slate-500">Učitavanje...</p>
          ) : error ? (
            <div className="mb-12 rounded-2xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
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
            <div className="mb-12 rounded-2xl border border-white bg-white p-12 text-center shadow-sm">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
                Trenutno nema majstora registrovanih za {cityName}.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Objavite besplatan zahtjev – dobijate ponude od više majstora iz ovog i okolnih gradova, bez obaveze.
              </p>
              <Link
                href={`/request/create?city=${encodeURIComponent(cityName)}`}
                className="mt-6 inline-flex h-14 items-center justify-center rounded-2xl bg-[#2563EB] px-8 text-lg font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)] transition hover:opacity-95"
              >
                Objavi besplatan zahtjev za {cityName}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-slate-500">
                {total} majstor(a)
              </div>
              <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {handymen.map((h) => (
                  <HandymanCard key={h.id} {...h} variant="compact" />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mb-12 flex items-center justify-center gap-2">
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

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Kategorije dostupne u {cityName}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}-${slug}`}
                className="rounded-xl border border-white bg-white px-4 py-3 text-center font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {cat.displayName}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
