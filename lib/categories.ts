/**
 * Centralni source of truth za kategorije
 * slug -> displayName -> internalCategory (REQUEST_CATEGORIES)
 * API i handyman profile koriste internalCategory.
 * Homepage, category pages, filters koriste slug i displayName.
 */

import { REQUEST_CATEGORIES } from "./constants";

export type CategoryConfig = {
  slug: string;
  displayName: string;
  internalCategory: (typeof REQUEST_CATEGORIES)[number];
  icon: string;
};

// Mapiranje slug -> displayName -> internalCategory
// internalCategory mora postojati u REQUEST_CATEGORIES
export const CATEGORY_CONFIG: CategoryConfig[] = [
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

// Slug -> displayName (za backward compatibility)
export const CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c.displayName])
);

// Slug -> internalCategory (za API i handyman profile)
export const SLUG_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.slug, c.internalCategory])
);

// DisplayName -> internalCategory (za edge cases)
export const DISPLAY_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.displayName, c.internalCategory])
);

export function getCategoryBySlug(slug: string): CategoryConfig | null {
  return CATEGORY_CONFIG.find((c) => c.slug === slug) ?? null;
}

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
