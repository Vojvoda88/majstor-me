/**
 * SEO landing: /{categorySlug}-{citySlug} npr. vodoinstalater-podgorica
 * Koristi se za generateStaticParams i interne linkove.
 */

import { CATEGORY_CONFIG } from "@/lib/categories";

export const SEO_LANDING_CITIES = [
  "podgorica",
  "niksic",
  "budva",
  "bar",
  "herceg-novi",
  "tivat",
  "kotor",
] as const;

/** Isti skup slugova kao javni listing (CATEGORY_CONFIG / PUBLIC_CATEGORY_LISTING) */
export const SEO_LANDING_CATEGORIES = CATEGORY_CONFIG.map((c) => c.slug);

export type SeoLandingCitySlug = (typeof SEO_LANDING_CITIES)[number];
export type SeoLandingCategorySlug = (typeof SEO_LANDING_CATEGORIES)[number];

/** Sve kombinacije za statičku generaciju */
export function getSeoLandingStaticParams(): { slug: string }[] {
  const out: { slug: string }[] = [];
  for (const cat of SEO_LANDING_CATEGORIES) {
    for (const city of SEO_LANDING_CITIES) {
      out.push({ slug: `${cat}-${city}` });
    }
  }
  return out;
}

/** Primjeri za početnu stranicu (interni linkovi) */
export const SEO_LANDING_HOMEPAGE_LINKS: { slug: string; label: string }[] = [
  { slug: "vodoinstalater-podgorica", label: "Vodoinstalater Podgorica" },
  { slug: "elektricar-niksic", label: "Električar Nikšić" },
  { slug: "sitni-kucni-poslovi-budva", label: "Sitni kućni poslovi Budva" },
  { slug: "keramicar-kotor", label: "Keramičar Kotor" },
  { slug: "stolar-bar", label: "Stolar Bar" },
];
