/**
 * SEO landing: /{categorySlug}-{citySlug} npr. vodoinstalater-podgorica
 * Koristi se za generateStaticParams i interne linkove.
 */

export const SEO_LANDING_CITIES = [
  "podgorica",
  "niksic",
  "budva",
  "bar",
  "herceg-novi",
  "tivat",
  "kotor",
] as const;

/** Slugovi koji postoje u lib/categories (CATEGORY_CONFIG) */
export const SEO_LANDING_CATEGORIES = [
  "vodoinstalater",
  "elektricar",
  "klima-servis",
  "keramicar",
  "stolar",
  "ciscenje",
] as const;

export type SeoLandingCitySlug = (typeof SEO_LANDING_CITIES)[number];
export type SeoLandingCategorySlug = (typeof SEO_LANDING_CATEGORIES)[number];

/** Sve kombinacije za statičku generaciju (7×6 = 42 stranice) */
export function getSeoLandingStaticParams(): { slug: string }[] {
  const out: { slug: string }[] = [];
  for (const cat of SEO_LANDING_CATEGORIES) {
    for (const city of SEO_LANDING_CITIES) {
      out.push({ slug: `${cat}-${city}` });
    }
  }
  return out;
}

/** Primjeri za početnu stranicu (3–5 internih linkova) */
export const SEO_LANDING_HOMEPAGE_LINKS: { slug: string; label: string }[] = [
  { slug: "vodoinstalater-podgorica", label: "Vodoinstalater Podgorica" },
  { slug: "elektricar-niksic", label: "Električar Nikšić" },
  { slug: "klima-servis-budva", label: "Klima servis Budva" },
  { slug: "keramicar-kotor", label: "Keramičar Kotor" },
  { slug: "stolar-bar", label: "Stolar Bar" },
];
