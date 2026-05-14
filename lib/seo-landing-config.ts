/**
 * SEO landing (marketing linkovi na početnoj): kanonski URL /{usluga}/{grad}
 * Stari jedan segment pretvara se u novi format (308).
 */

import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { CITY_SLUGS } from "@/lib/slugs";

export type SeoServiceCityLink = {
  slug: string;
  city: string;
  label: string;
};

/** Centralna lista gradova za SEO kombinacije (prvi talas). */
export const SEO_TARGET_CITY_SLUGS = [
  "podgorica",
  "niksic",
  "budva",
  "bar",
  "kotor",
  "herceg-novi",
  "tivat",
  "ulcinj",
  "cetinje",
  "danilovgrad",
  "bijelo-polje",
  "pljevlja",
  "berane",
  "rozaje",
  "kolasin",
] as const;

/** Mapiranje slug -> naziv kategorije samo za javne kategorije. */
export const SEO_CATEGORY_DISPLAY_BY_SLUG: Record<string, string> = Object.fromEntries(
  PUBLIC_CATEGORY_LISTING.map((c) => [c.slug, c.displayName])
);

/** Prioritetne kombinacije (money pages) za interni linking i crawl signale. */
export const PRIORITY_SEO_SERVICE_CITY_LINKS: SeoServiceCityLink[] = [
  { slug: "vodoinstalater", city: "podgorica", label: "Vodoinstalater Podgorica" },
  { slug: "elektricar", city: "podgorica", label: "Električar Podgorica" },
  { slug: "keramicar", city: "podgorica", label: "Keramičar Podgorica" },
  { slug: "moler", city: "podgorica", label: "Moler Podgorica" },
  { slug: "stolar", city: "podgorica", label: "Stolar Podgorica" },
  { slug: "selidbe", city: "podgorica", label: "Selidbe Podgorica" },
  { slug: "ciscenje", city: "podgorica", label: "Čišćenje Podgorica" },
  { slug: "klima-servis", city: "podgorica", label: "Klima servis Podgorica" },
  { slug: "vodoinstalater", city: "niksic", label: "Vodoinstalater Nikšić" },
  { slug: "elektricar", city: "niksic", label: "Električar Nikšić" },
  { slug: "keramicar", city: "niksic", label: "Keramičar Nikšić" },
  { slug: "selidbe", city: "niksic", label: "Selidbe Nikšić" },
  { slug: "vodoinstalater", city: "budva", label: "Vodoinstalater Budva" },
  { slug: "elektricar", city: "budva", label: "Električar Budva" },
  { slug: "keramicar", city: "budva", label: "Keramičar Budva" },
  { slug: "ciscenje", city: "budva", label: "Čišćenje Budva" },
  { slug: "selidbe", city: "budva", label: "Selidbe Budva" },
  { slug: "stolar", city: "bar", label: "Stolar Bar" },
  { slug: "moler", city: "bar", label: "Moler Bar" },
  { slug: "klima-servis", city: "bar", label: "Klima servis Bar" },
].filter((item) => SEO_CATEGORY_DISPLAY_BY_SLUG[item.slug] && CITY_SLUGS[item.city]);

/** Početna linkuje ka prioritetnim kombinacijama. */
export const SEO_LANDING_HOMEPAGE_LINKS: SeoServiceCityLink[] = PRIORITY_SEO_SERVICE_CITY_LINKS;

export function getPrioritySeoLinksForCity(citySlug: string, limit = 8): SeoServiceCityLink[] {
  return PRIORITY_SEO_SERVICE_CITY_LINKS.filter((item) => item.city === citySlug).slice(0, limit);
}

export function getPrioritySeoLinksForCategory(categorySlug: string, limit = 8): SeoServiceCityLink[] {
  return PRIORITY_SEO_SERVICE_CITY_LINKS.filter((item) => item.slug === categorySlug).slice(0, limit);
}
