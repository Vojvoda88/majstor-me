// Homepage display data - cities, images
// Kategorije su u lib/categories.ts (centralni source of truth)

import { CATEGORY_CONFIG } from "@/lib/categories";
import { getCategoryImageUrl } from "@/lib/category-images";

/** Hero pozadina (portret, lokalno) — uključeno u repo */
export const HERO_IMAGE = "/images/hero/hero-majstor-living-room.png";
/** Stari Unsplash samo ako treba rezervni URL (nije u upotrebi u Hero) */
export const HERO_IMAGE_FALLBACK = HERO_IMAGE;
/** Neutralan placeholder za avatare — ne koristiti hero sliku */
export const AVATAR_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80";

/** displayName -> URL slike (lokalno u /public/images/categories ili Unsplash) */
export const CATEGORY_IMAGES: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG.map((c) => [c.displayName, getCategoryImageUrl(c.slug)])
) as Record<string, string>;

// Gradovi za homepage grid (20)
export const HOMEPAGE_CITIES = [
  { name: "Podgorica", slug: "podgorica", image: "/images/cities/podgorica.jpg" },
  { name: "Nikšić", slug: "niksic", image: "/images/cities/niksic.jpg" },
  { name: "Budva", slug: "budva", image: "/images/cities/budva.jpg" },
  { name: "Kotor", slug: "kotor", image: "/images/cities/kotor.jpg" },
  { name: "Herceg Novi", slug: "herceg-novi", image: "/images/cities/herceg-novi.jpg" },
  { name: "Bar", slug: "bar", image: "/images/cities/bar.jpg" },
  { name: "Ulcinj", slug: "ulcinj", image: "/images/cities/ulcinj.jpg" },
  { name: "Tivat", slug: "tivat", image: "/images/cities/tivat.jpg" },
  { name: "Cetinje", slug: "cetinje", image: "/images/cities/cetinje.jpg" },
  { name: "Danilovgrad", slug: "danilovgrad", image: "/images/cities/danilovgrad.jpg" },
  { name: "Bijelo Polje", slug: "bijelo-polje", image: "/images/cities/bijelo-polje.jpg" },
  { name: "Pljevlja", slug: "pljevlja", image: "/images/cities/pljevlja.jpg" },
  { name: "Berane", slug: "berane", image: "/images/cities/berane.jpg" },
  { name: "Rožaje", slug: "rozaje", image: "/images/cities/berane.jpg" },
  { name: "Kolašin", slug: "kolasin", image: "/images/cities/kolasin.jpg" },
  { name: "Mojkovac", slug: "mojkovac", image: "/images/cities/kolasin.jpg" },
  { name: "Žabljak", slug: "zabljak", image: "/images/cities/zabljak.jpg" },
  { name: "Plav", slug: "plav", image: "/images/cities/berane.jpg" },
  { name: "Gusinje", slug: "gusinje", image: "/images/cities/berane.jpg" },
  { name: "Tuzi", slug: "tuzi", image: "/images/cities/podgorica.jpg" },
];
