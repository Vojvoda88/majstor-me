import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ACTIVE_PUBLIC_CATEGORY_COUNT,
  CATEGORY_CONFIG,
  REQUEST_CATEGORY_FALLBACK,
  REQUEST_CATEGORY_FALLBACK_DISPLAY,
} from "@/lib/categories";
import { getCategoryImageUrl } from "@/lib/category-images";
import { ArrowRight } from "lucide-react";
import { buildPublicListingPageJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { SEO_LANDING_CITIES } from "@/lib/seo-landing-config";
import { CITY_SLUGS } from "@/lib/slugs";

const baseUrl = getSiteUrl();

const categoriesDescription =
  "Sve kategorije majstora u Crnoj Gori — od vode i struje do klime i čišćenja. Otvorite uslugu ili pošaljite zahtjev.";

export const metadata: Metadata = {
  title: "Majstori po kategorijama",
  description: categoriesDescription,
  alternates: {
    canonical: `${baseUrl}/categories`,
  },
  openGraph: {
    title: "Majstori po kategorijama | BrziMajstor.ME",
    description: categoriesDescription,
    url: `${baseUrl}/categories`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Majstori po kategorijama | BrziMajstor.ME",
    description: categoriesDescription,
  },
};

export default function CategoriesPage() {
  const base = baseUrl.replace(/\/$/, "");
  const categoriesJsonLd = buildPublicListingPageJsonLd({
    canonicalUrl: `${base}/categories`,
    pageTitle: "Majstori po kategorijama",
    description: categoriesDescription,
    breadcrumbs: [
      { name: "Početna", itemUrl: base },
      { name: "Sve kategorije", itemUrl: `${base}/categories` },
    ],
  });

  return (
    <div className="min-h-screen bg-brand-page pb-28 md:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }} />
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <header className="mb-10 md:mb-14">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-5xl">
            Sve kategorije
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            {ACTIVE_PUBLIC_CATEGORY_COUNT} glavnih kategorija usluga — pronađite majstora za posao. Odaberite uslugu i
            pregledajte profile.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            <Link
              href={`/request/create?category=${encodeURIComponent(REQUEST_CATEGORY_FALLBACK)}`}
              className="font-semibold text-blue-700 underline-offset-2 hover:underline"
            >
              Ne vidiš svoju uslugu?
            </Link>{" "}
            U formi za zahtjev birate „{REQUEST_CATEGORY_FALLBACK_DISPLAY}“ — to nije posebna kartica u listi ispod; opišite
            posao u opisu.
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white/80 p-4 md:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Gradovi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SEO_LANDING_CITIES.map((citySlug) => {
                const name = CITY_SLUGS[citySlug];
                if (!name) return null;
                return (
                  <Link
                    key={citySlug}
                    href={`/grad/${citySlug}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-blue-200 hover:bg-blue-50"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">SEO stranice (usluga + grad)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/vodoinstalater-podgorica"
                className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-100"
              >
                Vodoinstalater Podgorica
              </Link>
              <Link
                href="/elektricar-niksic"
                className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-100"
              >
                Električar Nikšić
              </Link>
              <Link
                href="/klima-servis-budva"
                className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-blue-100"
              >
                Klima Budva
              </Link>
            </div>
          </div>
        </header>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_CONFIG.map((cat) => {
            const imgSrc = getCategoryImageUrl(cat.slug);
            return (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative flex min-h-[140px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_8px_28px_-12px_rgba(10,22,40,0.14)] ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_14px_36px_-12px_rgba(10,22,40,0.18)] md:min-h-[160px]"
                >
                  <div className="relative w-28 shrink-0 bg-slate-100 sm:w-32">
                    <Image
                      src={imgSrc}
                      alt={cat.displayName}
                      fill
                      className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.03]"
                      sizes="128px"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent md:hidden" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center px-5 py-5">
                    <span className="font-display text-lg font-bold text-brand-navy md:text-xl">{cat.displayName}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                      Pogledaj majstore
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <PublicFooter />
    </div>
  );
}
