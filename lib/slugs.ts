// Slug utilities for category and city URLs

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Re-export iz centralnog categories modula
import { CATEGORY_CONFIG, CATEGORY_SLUGS, getCategoryBySlug } from "./categories";
export { CATEGORY_SLUGS, CATEGORY_CONFIG };

// Gradovi - slug -> display name
export const CITY_SLUGS: Record<string, string> = {
  "podgorica": "Podgorica",
  "niksic": "Nikšić",
  "budva": "Budva",
  "kotor": "Kotor",
  "herceg-novi": "Herceg Novi",
  "bar": "Bar",
  "ulcinj": "Ulcinj",
  "tivat": "Tivat",
  "cetinje": "Cetinje",
  "danilovgrad": "Danilovgrad",
  "bijelo-polje": "Bijelo Polje",
  "pljevlja": "Pljevlja",
  "berane": "Berane",
  "rozaje": "Rožaje",
  "kolasin": "Kolašin",
  "mojkovac": "Mojkovac",
  "zabljak": "Žabljak",
  "plav": "Plav",
  "gusinje": "Gusinje",
  "tuzi": "Tuzi",
};

// Gradovi - nomativ -> lokativ (za ispravan prikaz "u Podgorici", "u Nikšiću" itd.)
const CITY_LOCATIVE_MAP: Record<string, string> = {
  "Podgorica": "Podgorici",
  "Nikšić": "Nikšiću",
  "Budva": "Budvi",
  "Kotor": "Kotoru",
  "Herceg Novi": "Herceg Novom",
  "Bar": "Baru",
  "Ulcinj": "Ulcinju",
  "Tivat": "Tivtu",
  "Cetinje": "Cetinju",
  "Danilovgrad": "Danilovgradu",
  "Bijelo Polje": "Bijelom Polju",
  "Pljevlja": "Pljevljima",
  "Berane": "Beranama",
  "Rožaje": "Rožajama",
  "Kolašin": "Kolašinu",
  "Mojkovac": "Mojkovcu",
  "Žabljak": "Žabljaku",
  "Plav": "Plavu",
  "Gusinje": "Gusinju",
  "Tuzi": "Tuzima",
  // Gradovi koji postoje u CITIES, ali ne nužno u CITY_SLUGS mapi
  "Šavnik": "Šavniku",
  "Andrijevica": "Andrijevici",
  "Petnjica": "Petnjici",
};

/** Genitiv za „iz grada“: iz Podgorice, iz Nikšića, iz Budve… */
const CITY_GENITIVE_MAP: Record<string, string> = {
  Podgorica: "Podgorice",
  Nikšić: "Nikšića",
  Budva: "Budve",
  Kotor: "Kotora",
  "Herceg Novi": "Herceg Novog",
  Bar: "Bara",
  Ulcinj: "Ulcinja",
  Tivat: "Tivta",
  Cetinje: "Cetinja",
  Danilovgrad: "Danilovgrada",
  "Bijelo Polje": "Bijelog Polja",
  Pljevlja: "Pljevlja",
  Berane: "Berana",
  Rožaje: "Rožaja",
  Kolašin: "Kolašina",
  Mojkovac: "Mojkovca",
  Žabljak: "Žabljaka",
  Plav: "Plava",
  Gusinje: "Gusinja",
  Tuzi: "Tuzija",
  Šavnik: "Šavnika",
  Andrijevica: "Andrijevice",
  Petnjica: "Petnjice",
};

export function cityLocative(name: string): string {
  return CITY_LOCATIVE_MAP[name] ?? name;
}

/** Genitiv imena grada (npr. „iz Podgorice“, „iz Nikšića“) */
export function cityGenitive(name: string): string {
  return CITY_GENITIVE_MAP[name] ?? name;
}

export function categoryToSlug(name: string): string {
  const entry = CATEGORY_CONFIG.find(
    (c) => c.displayName.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.slug : slugify(name);
}

export function cityToSlug(name: string): string {
  const entry = Object.entries(CITY_SLUGS).find(
    ([_, n]) => n.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry[0] : slugify(name);
}

const CITY_SLUG_LIST = Object.keys(CITY_SLUGS);
const CATEGORY_SLUG_LIST = Object.keys(CATEGORY_SLUGS);

/**
 * Parsira SEO slug formata "categorySlug-citySlug" npr. vodoinstalater-niksic, klima-servis-budva
 * Vraća { categorySlug, citySlug, categoryDisplayName, cityDisplayName, internalCategory } ili null
 */
export function parseCategoryCitySlug(combinedSlug: string): {
  categorySlug: string;
  citySlug: string;
  categoryDisplayName: string;
  cityDisplayName: string;
  internalCategory: string;
} | null {
  const parts = combinedSlug.split("-");
  if (parts.length < 2) return null;

  // Grad može biti 1-3 dijela (niksic, herceg-novi, bijelo-polje)
  for (let cityParts = 1; cityParts <= Math.min(3, parts.length); cityParts++) {
    const citySlug = parts.slice(-cityParts).join("-");
    const categorySlug = parts.slice(0, -cityParts).join("-");
    if (!categorySlug) continue;
    const cityName = CITY_SLUGS[citySlug];
    const config = getCategoryBySlug(categorySlug);
    if (cityName && config) {
      return {
        categorySlug,
        citySlug,
        categoryDisplayName: config.displayName,
        cityDisplayName: cityName,
        internalCategory: config.internalCategory,
      };
    }
  }
  return null;
}

/** Generiše sve validne category-city SEO slugove za sitemap */
export function getAllCategoryCitySlugs(): { slug: string; categoryDisplayName: string; cityDisplayName: string }[] {
  const result: { slug: string; categoryDisplayName: string; cityDisplayName: string }[] = [];
  for (const catSlug of CATEGORY_SLUG_LIST) {
    const catName = CATEGORY_SLUGS[catSlug];
    if (!catName) continue;
    for (const citySlug of CITY_SLUG_LIST) {
      const cityName = CITY_SLUGS[citySlug];
      if (!cityName) continue;
      result.push({
        slug: `${catSlug}-${citySlug}`,
        categoryDisplayName: catName,
        cityDisplayName: cityName,
      });
    }
  }
  return result;
}
