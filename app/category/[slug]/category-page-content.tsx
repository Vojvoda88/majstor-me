"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HomeHeader } from "@/components/home-page/home-header";
import { Star, Wrench, MapPin } from "lucide-react";
import { CITIES } from "@/lib/constants";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

export function CategoryPageContent({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  const searchParams = useSearchParams();
  const cityFromUrl = searchParams.get("city") ?? "";
  const [handymen, setHandymen] = useState<Handyman[]>([]);
  const [cityFilter, setCityFilter] = useState<string>(cityFromUrl);
  const [sortBy, setSortBy] = useState<"rating" | "reviews">("rating");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCityFilter(cityFromUrl);
  }, [cityFromUrl]);

  useEffect(() => {
    async function fetchHandymen() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("category", category);
      if (cityFilter) params.set("city", cityFilter);
      params.set("sortBy", sortBy);
      const res = await fetch(`/api/handymen?${params}`);
      const data = await res.json();
      setHandymen(data.handymen || []);
      setLoading(false);
    }
    fetchHandymen();
  }, [category, cityFilter, sortBy]);

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
            <span className="font-medium text-slate-900">{category}</span>
          </nav>

          <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {category}
          </h1>

          <div className="mb-6 flex flex-wrap gap-4">
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
                href="/request/create"
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Objavi zahtjev
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {handymen.map((h) => (
                <Link
                  key={h.id}
                  href={`/handyman/${h.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Wrench className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900">{h.name || "Majstor"}</h3>
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {h.city || "Crna Gora"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{h.ratingAvg.toFixed(1)}</span>
                      <span className="text-slate-400">({h.reviewCount} recenzija)</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
