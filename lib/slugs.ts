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
import { CATEGORY_CONFIG, CATEGORY_SLUGS } from "./categories";
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
