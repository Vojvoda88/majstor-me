"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeHeader } from "@/components/home-page/home-header";
import { Star, Wrench } from "lucide-react";
import { POPULAR_CATEGORIES } from "@/lib/homepage-data";

type Handyman = {
  id: string;
  name: string | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHandymen() {
      setLoading(true);
      const res = await fetch(
        `/api/handymen?city=${encodeURIComponent(cityName)}`
      );
      const data = await res.json();
      setHandymen(data.handymen || []);
      setLoading(false);
    }
    fetchHandymen();
  }, [cityName]);

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
                Majstori u {cityName}
              </h1>
            </div>
          )}

          {!cityImage && (
            <h1 className="mb-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Majstori u {cityName}
            </h1>
          )}

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Majstori u ovom gradu
          </h2>

          {loading ? (
            <p className="py-12 text-center text-slate-500">Učitavanje...</p>
          ) : handymen.length === 0 ? (
            <div className="mb-12 rounded-2xl border border-white bg-white p-12 text-center shadow-sm">
              <Wrench className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">
                Trenutno nema majstora registrovanih za {cityName}.
              </p>
              <Link
                href="/request/create"
                className="mt-4 inline-block font-medium text-blue-600 hover:underline"
              >
                Objavi zahtjev
              </Link>
            </div>
          ) : (
            <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <h3 className="font-bold text-slate-900">
                      {h.name || "Majstor"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {h.categories[0] || "Majstor"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">
                        {h.ratingAvg.toFixed(1)}
                      </span>
                      <span className="text-slate-400">
                        ({h.reviewCount} recenzija)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Kategorije dostupne u {cityName}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}?city=${encodeURIComponent(cityName)}`}
                className="rounded-xl border border-white bg-white px-4 py-3 text-center font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
