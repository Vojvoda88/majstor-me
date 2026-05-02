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
import { SEO_CATEGORIES_DESCRIPTION } from "@/lib/seo-brand";

const baseUrl = getSiteUrl();

const categoriesDescription = SEO_CATEGORIES_DESCRIPTION;

const CATEGORY_SUBTEXT: Record<string, string> = {
  vodoinstalater: "Curenja, bojleri, slavine i hitne intervencije",
  elektricar: "Kvarovi, osigurači, rasveta i instalacije",
  "klima-servis": "Montaža, servis i sezonsko čišćenje klime",
  keramicar: "Kupatila, pločice, fugovanje i nivelacija",
  stolar: "Namještaj, kuhinje, vrata i popravke",
  "pvc-stolarija": "Prozori, vrata, podešavanja i zamene",
  bravar: "Brave, sigurnost, metalni radovi i popravke",
  moler: "Krečenje, priprema zidova i završni radovi",
  gipsar: "Spušteni plafoni, pregrade i dekor gips",
  fasader: "Izolacija, fasada i obnova spoljašnjih zidova",
  "grubi-gradjevinski-radovi": "Zidanje, beton, skela, grub zidar i glavni građevinski radovi",
  ciscenje: "Stanovi, lokali i dubinsko čišćenje",
  selidbe: "Selidbe stanova, kancelarija i transport",
  bastovanstvo: "Dvorišta, rezidba, održavanje i uređenje",
  "sitni-kucni-poslovi": "Montaža, sitne popravke i pomoć po kući",
};

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
    <div className="min-h-screen bg-brand-page pb-20 pt-16 md:pb-10 md:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }} />
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-5 md:px-8 md:pb-14 md:pt-8">
        <header className="mb-7 md:mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-5xl">
            Sve kategorije
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            {ACTIVE_PUBLIC_CATEGORY_COUNT} glavnih kategorija usluga — pronađite majstora za posao. Izaberite uslugu i
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
        </header>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {CATEGORY_CONFIG.map((cat) => {
            const imgSrc = getCategoryImageUrl(cat.slug);
            const subtext = CATEGORY_SUBTEXT[cat.slug] ?? "Pogledajte profile majstora i pošaljite zahtjev.";
            return (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative flex min-h-[132px] overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_34px_-16px_rgba(10,22,40,0.18)] ring-1 ring-slate-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_18px_44px_-16px_rgba(10,22,40,0.24)] md:min-h-[154px]"
                >
                  <div className="relative w-24 shrink-0 bg-slate-100 sm:w-28 md:w-32">
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
                  <div className="flex flex-1 flex-col justify-center px-4 py-4 md:px-5 md:py-5">
                    <span className="font-display text-[1.08rem] font-bold leading-tight text-brand-navy md:text-[1.24rem]">
                      {cat.displayName}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-600 md:text-sm">{subtext}</span>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
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
