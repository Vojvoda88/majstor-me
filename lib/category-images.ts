/**
 * Slike kategorija — lokalni asset-i iz /public/images/categories.
 * Cilj: izbjegavanje dodatnih remote image transformacija.
 */

import { CATEGORY_CONFIG_FULL } from "@/lib/categories";

const SLUG_IMAGE_LOCAL: Record<string, string> = {
  vodoinstalater: "/images/categories/vodoinstalater.png",
  elektricar: "/images/categories/elektricar.png",
  keramicar: "/images/categories/keramicar.png",
  gipsar: "/images/categories/gipsar.png",
  stolar: "/images/categories/stolar.png",
  bravar: "/images/categories/bravar.png",
  fasader: "/images/categories/fasader.png",
  parketar: "/images/categories/parketar.png",
  bastovanstvo: "/images/categories/bastovanstvo.png",
  ciscenje: "/images/categories/ciscenje.png",
  "pvc-stolarija": "/images/categories/pvc-stolarija.png",
  selidbe: "/images/categories/selidbe.png",
  "grubi-gradjevinski-radovi": "/images/categories/grubi-gradjevinski-radovi.png",
  "klima-servis": "/images/categories/klima-servis.png",
  // Legacy/sekundarne kategorije mapirane na najbliže lokalne vizuale.
  "servis-bojlera": "/images/categories/vodoinstalater.png",
  krovopokrivac: "/images/categories/fasader.png",
  "sitni-kucni-poslovi": "/images/categories/stolar.png",
  "moler-gipsar": "/images/categories/gipsar.png",
  moler: "/images/categories/fasader.png",
};

export function getCategoryImageUrl(slug: string): string {
  return SLUG_IMAGE_LOCAL[slug] ?? "/images/categories/stolar.png";
}

const DEFAULT_HERO_SLUG = "sitni-kucni-poslovi";

/**
 * Hero slika za majstora bez avatara/galerije — prva kategorija iz profila (DB `Category.name` = internalCategory).
 */
export function getCategoryHeroImageForWorkerCategories(internalCategoryNames: string[]): string {
  if (!internalCategoryNames?.length) {
    return getCategoryImageUrl(DEFAULT_HERO_SLUG);
  }
  const raw = internalCategoryNames[0]?.trim();
  if (!raw) {
    return getCategoryImageUrl(DEFAULT_HERO_SLUG);
  }
  const byInternal = CATEGORY_CONFIG_FULL.find((c) => c.internalCategory === raw);
  const byDisplay = byInternal ?? CATEGORY_CONFIG_FULL.find((c) => c.displayName === raw);
  const slug = byDisplay?.slug ?? DEFAULT_HERO_SLUG;
  return getCategoryImageUrl(slug);
}
