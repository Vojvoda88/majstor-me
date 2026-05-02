/**
 * Programatske SEO rute: usluga (slug kategorije) × grad.
 * Gradovi: ista lista kao na početnoj (20) — skalabilno ~15×20 = 300 stranica.
 */

import { getCategoryBySlug, PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { isReservedSeoServiceSegment } from "@/lib/seo-reserved-segments";
import { CITY_SLUGS } from "@/lib/slugs";

/** `slug` = javni slug kategorije (isti naziv segmenta kao u app/(seo)/[slug] na jednom nivou). */
export function getProgrammaticServiceCityParams(): { slug: string; city: string }[] {
  const out: { slug: string; city: string }[] = [];
  for (const cat of PUBLIC_CATEGORY_LISTING) {
    if (isReservedSeoServiceSegment(cat.slug)) continue;
    for (const c of HOMEPAGE_CITIES) {
      if (!CITY_SLUGS[c.slug]) continue;
      out.push({ slug: cat.slug, city: c.slug });
    }
  }
  return out;
}

export function isValidProgrammaticServiceCity(
  categorySlug: string,
  city: string
): { ok: true } | { ok: false } {
  if (isReservedSeoServiceSegment(categorySlug)) return { ok: false };
  const cat = getCategoryBySlug(categorySlug);
  if (!cat?.publicListing) return { ok: false };
  if (!CITY_SLUGS[city]) return { ok: false };
  return { ok: true };
}

/** Stari format u sitemapu / priority copy — i dalje ključ za getPrioritySeoLandingContent */
export function toLegacyServiceCitySlug(categorySlug: string, city: string): string {
  return `${categorySlug}-${city}`;
}
