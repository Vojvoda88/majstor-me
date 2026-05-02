/**
 * SEO landing (marketing linkovi na početnoj): kanonski URL /{usluga}/{grad}
 * Stari jedan segment pretvara se u novi format (308).
 */

/** Primjeri za početnu stranicu (interni linkovi) */
export const SEO_LANDING_HOMEPAGE_LINKS: { slug: string; city: string; label: string }[] = [
  { slug: "vodoinstalater", city: "podgorica", label: "Vodoinstalater Podgorica" },
  { slug: "elektricar", city: "niksic", label: "Električar Nikšić" },
  { slug: "sitni-kucni-poslovi", city: "budva", label: "Sitni kućni poslovi Budva" },
  { slug: "keramicar", city: "kotor", label: "Keramičar Kotor" },
  { slug: "stolar", city: "bar", label: "Stolar Bar" },
];
