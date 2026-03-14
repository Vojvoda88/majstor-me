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

// Popularne kategorije - slug -> display name
export const CATEGORY_SLUGS: Record<string, string> = {
  "vodoinstalater": "Vodoinstalater",
  "elektricar": "Električar",
  "keramicar": "Keramičar",
  "gipsar": "Gipsar",
  "stolar": "Stolar",
  "bravar": "Bravar",
  "fasader": "Fasader",
  "parketar": "Parketar",
  "klima-servis": "Klima servis",
  "servis-bojlera": "Servis bojlera",
  "servis-bijele-tehnike": "Servis bijele tehnike",
  "selidbe": "Selidbe",
  "ciscenje": "Čišćenje",
  "bastovanstvo": "Baštovanstvo",
  "pvc-stolarija": "PVC stolarija",
  "krovopokrivac": "Krovopokrivač",
};

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
  const entry = Object.entries(CATEGORY_SLUGS).find(
    ([_, n]) => n.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry[0] : slugify(name);
}

export function cityToSlug(name: string): string {
  const entry = Object.entries(CITY_SLUGS).find(
    ([_, n]) => n.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry[0] : slugify(name);
}
