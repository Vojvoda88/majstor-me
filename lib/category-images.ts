/**
 * Slike kategorija — lokalne PNG (majstorske fotografije) + Unsplash za ostale dok ne stignu vlastite.
 */

/** Lokalne slike u /public/images/categories/{slug}.png — jedna po usluzi, bez duple upotrebe iste fotke. */
export const LOCAL_CATEGORY_SLUGS = [
  "vodoinstalater",
  "elektricar",
  "keramicar",
  "gipsar",
  "stolar",
  "bravar",
  "fasader",
  "parketar",
  "bastovanstvo",
  "ciscenje",
  "pvc-stolarija",
  "selidbe",
  "servis-bijele-tehnike",
  "klima-servis",
] as const;

const UNSPLASH = {
  bojler: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop&q=80",
  krov: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80",
} as const;

/** Kategorije bez lokalne slike — privremeno Unsplash (zamijeni kasnije vlastitim fajlovima). */
const SLUG_IMAGE_REMOTE: Record<string, string> = {
  "servis-bojlera": UNSPLASH.bojler,
  krovopokrivac: UNSPLASH.krov,
  "sitni-kucni-poslovi": UNSPLASH.default,
  "moler-gipsar": UNSPLASH.default,
  moler: UNSPLASH.default,
};

export function getCategoryImageUrl(slug: string): string {
  if ((LOCAL_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    return `/images/categories/${slug}.png`;
  }
  return SLUG_IMAGE_REMOTE[slug] ?? UNSPLASH.default;
}
