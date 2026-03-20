"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Wrench, ChevronLeft, ChevronRight, MapPin, ArrowRight } from "lucide-react";
import { HandymanCard } from "@/components/lists/handyman-card";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { cityGenitive, cityLocative } from "@/lib/slugs";

type Handyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
};

function buildIntroParagraph(displayName: string, cityLoc: string, cityGen: string): string {
  const service = displayName.toLowerCase();
  return `Tražite pouzdanog ${service}a u ${cityLoc}? Na BrziMajstor.ME možete brzo pronaći provjerene majstore koji dolaze na vašu adresu. Bez obzira da li vam treba hitna intervencija ili planirani radovi, jednim zahtjevom dobijate ponude od stručnjaka iz ${cityGen} i okolice. Platforma štedi vrijeme: ne morate zvati redom niti tražiti preporuke — opišite posao, odaberite grad i uporedite ocjene i recenzije. Majstori koji su aktivni u vašoj zoni mogu vam se javiti u kratkom roku. Svi profili su povezani sa iskustvima stvarnih korisnika, što olakšava odluku. Pošaljite zahtjev besplatno i izaberite ponudu koja vam najviše odgovara.`;
}

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
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const cityNameLocative = cityLocative(cityName);
  const cityGen = cityGenitive(cityName);
  const intro = buildIntroParagraph(displayName, cityNameLocative, cityGen);

  useEffect(() => {
    setPage(1);
  }, [internalCategory, cityName, sortBy]);

  useEffect(() => {
    let cancelled = false;

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
            <Link href="/categories" className="hover:text-slate-700">
              Kategorije
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900">{displayName}</span>
          </nav>

          <h1 className="mb-5 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
            {displayName} u {cityNameLocative} – BrziMajstor.ME
          </h1>

          <p className="mb-8 max-w-3xl text-base leading-relaxed text-slate-700 sm:text-[1.05rem]">{intro}</p>

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
              Pošaljite zahtjev i majstori će vam se javiti u roku od par minuta.
            </p>
            <Link
              href={createUrl}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] px-6 py-3.5 text-base font-bold text-white shadow-btn-cta transition hover:brightness-105"
            >
              Objavi zahtjev
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>

          {/* FAQ za SEO */}
          <section className="mt-10 rounded-2xl border border-white bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Često postavljana pitanja</h2>
            <div className="space-y-5 text-sm leading-relaxed text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Koliko košta {displayName.toLowerCase()} u {cityNameLocative}?
                </h3>
                <p>
                  Cijena zavisi od vrste posla, materijala i hitnosti. Na BrziMajstor.ME dobijate više ponuda pa možete
                  uporediti cijene prije nego što angažujete majstora.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Koliko brzo dolazi majstor?</h3>
                <p>
                  Zavisno od dostupnosti i hitnosti, mnogi majstori odgovaraju u roku od nekoliko minuta do nekoliko
                  sati. U zahtjevu navedite kada vam odgovara dolazak.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Da li su majstori provjereni?</h3>
                <p>
                  Majstori na BrziMajstor.ME imaju recenzije od stvarnih korisnika. Verifikovani majstori imaju dodatnu
                  provjeru identiteta.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
