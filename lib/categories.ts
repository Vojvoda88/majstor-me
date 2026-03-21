/**
 * Centralni source of truth za kategorije
 * slug -> displayName -> internalCategory (REQUEST_CATEGORIES)
 * API i handyman profile koriste internalCategory.
 * Homepage, category pages, filters koriste slug i displayName.
 */

import { REQUEST_CATEGORIES, REQUEST_CATEGORY_FALLBACK } from "./constants";

export type CategoryConfig = {
  slug: string;
  displayName: string;
  internalCategory: (typeof REQUEST_CATEGORIES)[number];
  icon: string;
};

/**
 * Skrivene od javnog prikaza (homepage, /categories, javni izbori) — i dalje u bazi / istoriji zahtjeva.
 * Slugovi ostaju u CATEGORY_CONFIG_FULL radi /category/[slug] i mapiranja.
 */
export const HIDDEN_FROM_PUBLIC_SLUGS = new Set([
  "parketar",
  "servis-bojlera",
  "krovopokrivac",
]);

/** Sve konfigurisane kategorije (uključujući skrivene od javnog listinga). */
export const CATEGORY_CONFIG_FULL: CategoryConfig[] = [
  { slug: "vodoinstalater", displayName: "Vodoinstalater", internalCategory: "Vodoinstalater", icon: "Wrench" },
  { slug: "elektricar", displayName: "Električar", internalCategory: "Električar", icon: "Zap" },
  { slug: "keramicar", displayName: "Keramičar", internalCategory: "Keramičar", icon: "Grid3X3" },
  { slug: "gipsar", displayName: "Gipsar", internalCategory: "Moler / gipsar", icon: "Paintbrush" },
  { slug: "stolar", displayName: "Stolar", internalCategory: "Stolar", icon: "Hammer" },
  { slug: "bravar", displayName: "Bravar", internalCategory: "Bravar", icon: "Key" },
  { slug: "fasader", displayName: "Fasader", internalCategory: "Fasade / izolacija", icon: "Building2" },
  { slug: "parketar", displayName: "Parketar", internalCategory: "Parketar", icon: "Layout" },
  { slug: "klima-servis", displayName: "Klima servis", internalCategory: "Klima servis", icon: "Thermometer" },
  { slug: "servis-bojlera", displayName: "Servis bojlera", internalCategory: "Servis bojlera", icon: "Flame" },
  { slug: "servis-bijele-tehnike", displayName: "Servis bijele tehnike", internalCategory: "Servis bijele tehnike", icon: "Package" },
  { slug: "selidbe", displayName: "Selidbe", internalCategory: "Selidbe", icon: "Truck" },
  { slug: "ciscenje", displayName: "Čišćenje", internalCategory: "Čišćenje", icon: "Sparkles" },
  { slug: "bastovanstvo", displayName: "Baštovanstvo", internalCategory: "Dvorište / bašta", icon: "TreeDeciduous" },
  { slug: "pvc-stolarija", displayName: "PVC stolarija", internalCategory: "PVC stolarija", icon: "Square" },
  { slug: "krovopokrivac", displayName: "Krovopokrivač", internalCategory: "Krovopokrivač", icon: "Home" },
];

/** Javni listing (homepage, /categories, hero, sitemap kategorija…) */
export const CATEGORY_CONFIG: CategoryConfig[] = CATEGORY_CONFIG_FULL.filter(
  (c) => !HIDDEN_FROM_PUBLIC_SLUGS.has(c.slug)
);

// Slug -> displayName (puni skup — SEO /category/[slug], parse slug)
export const CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.slug, c.displayName])
);

// Slug -> internalCategory (puni skup)
export const SLUG_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.slug, c.internalCategory])
);

// DisplayName -> internalCategory (puni skup)
export const DISPLAY_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.displayName, c.internalCategory])
);

export function getCategoryBySlug(slug: string): CategoryConfig | null {
  return CATEGORY_CONFIG_FULL.find((c) => c.slug === slug) ?? null;
}

/** internalCategory vrijednosti koje se ne nude u javnom /request/create (usklađeno sa REQUEST_CATEGORIES) */
export const INTERNAL_CATEGORY_HIDDEN_FROM_PUBLIC = new Set([
  "Krovopokrivač",
  "Parketar",
  "Servis bojlera",
]);

/** Vraća internal category za API/handyman - koristi slug ili displayName */
export function getInternalCategory(input: string): string | null {
  const slug = input.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return SLUG_TO_INTERNAL[slug] ?? DISPLAY_TO_INTERNAL[input] ?? (REQUEST_CATEGORIES.includes(input as any) ? input : null);
}

/** Vraća displayName za slug */
export function getDisplayName(slug: string): string | null {
  return CATEGORY_SLUGS[slug] ?? null;
}

/** Da li je slug validan */
export function isCategorySlugValid(slug: string): boolean {
  return slug in SLUG_TO_INTERNAL;
}

/** Popularne kategorije za homepage - iz centralnog config-a */
export const POPULAR_CATEGORIES = CATEGORY_CONFIG;

/**
 * Kratki naziv usluge za push / notifikacije (internal category iz zahtjeva).
 */
export function displayLabelForRequestCategory(internalCategory: string): string {
  if (internalCategory === REQUEST_CATEGORY_FALLBACK) {
    return "Usluga po opisu";
  }
  const found = CATEGORY_CONFIG_FULL.find((c) => c.internalCategory === internalCategory);
  return found?.displayName ?? internalCategory;
}
