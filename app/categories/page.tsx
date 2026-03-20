import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { ArrowRight } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

const CATEGORY_IMAGES: Record<string, string> = {
  Vodoinstalater: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop",
  Električar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop",
  Keramičar: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=600&auto=format&fit=crop",
  "Klima servis": "https://images.unsplash.com/photo-1595467793069-45069736f88d?w=600&auto=format&fit=crop",
  Stolar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop",
  Čišćenje: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=600&auto=format&fit=crop",
};

export const metadata: Metadata = {
  title: "Sve kategorije majstora | Majstor.me",
  description:
    "Pregledajte sve kategorije usluga u Crnoj Gori – vodoinstalater, električar, klima servis, keramičar i druge. Brzo pronađite pravog majstora za svaki posao.",
  alternates: {
    canonical: `${baseUrl}/categories`,
  },
  openGraph: {
    title: "Sve kategorije majstora | Majstor.me",
    description:
      "Pregledajte sve kategorije usluga u Crnoj Gori i pronađite provjerenog majstora – od vodoinstalatera i električara do selidbi i čišćenja.",
    url: `${baseUrl}/categories`,
    type: "website",
  },
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-brand-page pb-28 pt-16 md:pb-10 md:pt-20">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <header className="mb-10 md:mb-14">
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-5xl">
            Sve kategorije
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            {CATEGORY_CONFIG.length} kategorija — pronađite majstora za svaki posao. Odaberite uslugu i pregledajte
            profile.
          </p>
        </header>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {CATEGORY_CONFIG.map((cat) => {
            const imgSrc = CATEGORY_IMAGES[cat.displayName] ?? CATEGORY_IMAGES.Vodoinstalater;
            return (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group relative flex min-h-[140px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-marketplace-sm transition hover:-translate-y-1 hover:shadow-marketplace md:min-h-[160px]"
                >
                  <div className="relative w-28 shrink-0 sm:w-32">
                    <Image
                      src={imgSrc}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
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
    </div>
  );
}
