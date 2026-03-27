/**
 * Jedan izvor istine za kategorije (BrziMajstor.ME).
 * - internalCategory = vrijednost u Request.category i Category.name (baza)
 * - displayName = SEO / javne stranice / UI gdje treba konzistentan prikaz
 * - slug = /category/[slug], hero, ?category= mapiranje
 */

// ─── Fallback (DB string — ne mijenjati) ─────────────────────────────────────
export const REQUEST_CATEGORY_FALLBACK = "Ne vidim svoju uslugu" as const;

/** Prikaz u formama / hero / notifikacijama (konzistentan label) */
export const REQUEST_CATEGORY_FALLBACK_DISPLAY = "Ostalo / Ne vidim svoju uslugu" as const;

/**
 * 15 glavnih usluga (javni listing /category/[slug], /categories, hero select).
 * + 1 kontrolisani fallback u formi (REQUEST_CATEGORY_FALLBACK) — nije javna kartica.
 */
export const ACTIVE_INTERNAL_CATEGORY_NAMES = [
  "Vodoinstalater",
  "Električar",
  "Klima servis",
  "Keramičar",
  "Stolar",
  "PVC stolarija",
  "Bravar",
  "Moler",
  "Gipsar",
  "Fasade / izolacija",
  "Servis bijele tehnike",
  "Čišćenje",
  "Selidbe",
  "Dvorište / bašta",
  "Sitni kućni poslovi",
] as const;

/** Stari nazivi u bazi / istoriji — validni za čitanje i API, nisu u novim dropdown-ima */
export const LEGACY_INTERNAL_CATEGORY_NAMES = [
  "Moler / gipsar",
  "Moler / sitne kućne popravke",
  "Montaža namještaja",
  "Krovopokrivač",
  "Parketar",
  "Građevinski radovi",
  "Servis bojlera",
  "Servis veš mašina",
  "Servis frižidera",
  "Servis šporeta / rerne",
  "Servis elektronike",
  "Servis računara / laptopa",
  "TV / antene / internet instalacije",
  "Ugradnja kuhinja",
  "Dubinsko čišćenje",
  "Sitne kućne popravke",
  "Alarm / video nadzor",
  "Roletne / tende",
  "Gipsani radovi",
  "Sanacija vlage",
  "Odvoz šuta / otpada",
  "Brave / hitna otvaranja",
  "Solarni sistemi / paneli",
] as const;

/** Svi poznati internal nazivi (novi unos + legacy + fallback) — zod / validacija */
export const REQUEST_CATEGORIES = [
  ...ACTIVE_INTERNAL_CATEGORY_NAMES,
  ...LEGACY_INTERNAL_CATEGORY_NAMES,
  REQUEST_CATEGORY_FALLBACK,
] as const;

export type RequestCategoryInternal = (typeof REQUEST_CATEGORIES)[number];

/** Samo aktivni + fallback — tačno za /request/create dropdown */
export const REQUEST_CREATE_CATEGORY_CHOICES = [
  ...ACTIVE_INTERNAL_CATEGORY_NAMES,
  REQUEST_CATEGORY_FALLBACK,
] as const;

/** Broj usluga sa javnim karticama (bez „Ostalo / Ne vidim svoju uslugu“). Izvor za isti broj u cijelom javnom UI-u. */
export const ACTIVE_PUBLIC_CATEGORY_COUNT = ACTIVE_INTERNAL_CATEGORY_NAMES.length;

/** Ukupno opcija u formi za kategoriju (15 usluga + fallback). */
export const REQUEST_FORM_CATEGORY_OPTION_COUNT = REQUEST_CREATE_CATEGORY_CHOICES.length;

export type CategoryConfig = {
  slug: string;
  displayName: string;
  /** Jednako internal nazivu u bazi */
  internalCategory: string;
  icon: string;
  /** Javni listing (/categories, homepage grid) */
  publicListing: boolean;
  /** Checkbox na profilu majstora i novi zahtjevi (fallback nije profil) */
  selectableForHandyman: boolean;
};

/**
 * Kanonski redoslijed — 15 aktivnih usluga (publicListing) + legacy slugovi za stare URL-ove / istoriju.
 * Legacy unosi (npr. „Moler / gipsar“) imaju publicListing: false — ne ulaze u CATEGORY_CONFIG.
 */
export const CATEGORY_CONFIG_FULL: CategoryConfig[] = [
  {
    slug: "vodoinstalater",
    displayName: "Vodoinstalater",
    internalCategory: "Vodoinstalater",
    icon: "Wrench",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "elektricar",
    displayName: "Električar",
    internalCategory: "Električar",
    icon: "Zap",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "klima-servis",
    displayName: "Klima servis",
    internalCategory: "Klima servis",
    icon: "Thermometer",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "keramicar",
    displayName: "Keramičar",
    internalCategory: "Keramičar",
    icon: "Grid3X3",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "stolar",
    displayName: "Stolar",
    internalCategory: "Stolar",
    icon: "Hammer",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "pvc-stolarija",
    displayName: "PVC stolarija",
    internalCategory: "PVC stolarija",
    icon: "Square",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "bravar",
    displayName: "Bravar",
    internalCategory: "Bravar",
    icon: "Key",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "moler",
    displayName: "Moler",
    internalCategory: "Moler",
    icon: "Paintbrush",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "gipsar",
    displayName: "Gipsar",
    internalCategory: "Gipsar",
    icon: "Paintbrush",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "fasader",
    displayName: "Fasade / izolacija",
    internalCategory: "Fasade / izolacija",
    icon: "Building2",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "servis-bijele-tehnike",
    displayName: "Servis bijele tehnike",
    internalCategory: "Servis bijele tehnike",
    icon: "Package",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "ciscenje",
    displayName: "Čišćenje",
    internalCategory: "Čišćenje",
    icon: "Sparkles",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "selidbe",
    displayName: "Selidbe",
    internalCategory: "Selidbe",
    icon: "Truck",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "bastovanstvo",
    displayName: "Dvorište / bašta",
    internalCategory: "Dvorište / bašta",
    icon: "TreeDeciduous",
    publicListing: true,
    selectableForHandyman: true,
  },
  {
    slug: "sitni-kucni-poslovi",
    displayName: "Sitni kućni poslovi",
    internalCategory: "Sitni kućni poslovi",
    icon: "House",
    publicListing: true,
    selectableForHandyman: true,
  },
  // Stari zajednički unos — samo istorija / SEO, ne u novim izborima
  {
    slug: "moler-gipsar",
    displayName: "Moler / gipsar",
    internalCategory: "Moler / gipsar",
    icon: "Paintbrush",
    publicListing: false,
    selectableForHandyman: false,
  },
  {
    slug: "parketar",
    displayName: "Parketar",
    internalCategory: "Parketar",
    icon: "Layout",
    publicListing: false,
    selectableForHandyman: false,
  },
  {
    slug: "servis-bojlera",
    displayName: "Servis bojlera",
    internalCategory: "Servis bojlera",
    icon: "Flame",
    publicListing: false,
    selectableForHandyman: false,
  },
  {
    slug: "krovopokrivac",
    displayName: "Krovopokrivač",
    internalCategory: "Krovopokrivač",
    icon: "Home",
    publicListing: false,
    selectableForHandyman: false,
  },
];

/** Javni listing (homepage, /categories, hero) — samo aktivni fokus; dužina === ACTIVE_PUBLIC_CATEGORY_COUNT */
export const CATEGORY_CONFIG: CategoryConfig[] = CATEGORY_CONFIG_FULL.filter((c) => c.publicListing);

if (CATEGORY_CONFIG.length !== ACTIVE_PUBLIC_CATEGORY_COUNT) {
  throw new Error(
    `lib/categories: CATEGORY_CONFIG.length (${CATEGORY_CONFIG.length}) must equal ACTIVE_PUBLIC_CATEGORY_COUNT (${ACTIVE_PUBLIC_CATEGORY_COUNT})`
  );
}

/** Isti skup kao CATEGORY_CONFIG (naziv „popular“ je historijski; koristi CATEGORY_CONFIG ili PUBLIC_CATEGORY_LISTING). */
export const PUBLIC_CATEGORY_LISTING: CategoryConfig[] = CATEGORY_CONFIG;

export const POPULAR_CATEGORIES = CATEGORY_CONFIG;

/** Profil majstora: aktivni skup (bez fallback) */
export const HANDYMAN_SELECTABLE_INTERNAL_NAMES: readonly string[] = ACTIVE_INTERNAL_CATEGORY_NAMES;

// Slug -> displayName (puni skup)
export const CATEGORY_SLUGS: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.slug, c.displayName])
);

// Slug -> internalCategory
export const SLUG_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.slug, c.internalCategory])
);

// DisplayName -> internalCategory (jedinstveno po kanonskim unosima)
export const DISPLAY_TO_INTERNAL: Record<string, string> = Object.fromEntries(
  CATEGORY_CONFIG_FULL.map((c) => [c.displayName, c.internalCategory])
);

/** Sitni poslovi — stare oznake u istoj grupi */
const SITNI_GROUP = [
  "Sitni kućni poslovi",
  "Sitne kućne popravke",
  "Moler / sitne kućne popravke",
] as const;

function isSitniGroup(name: string): boolean {
  return (SITNI_GROUP as readonly string[]).includes(name);
}

/** Da li majstorova kategorija odgovara kategoriji zahtjeva (sitni + moler/gipsar split) */
export function workerCategoryMatchesRequest(
  workerCategoryName: string,
  requestCategory: string
): boolean {
  if (workerCategoryName === requestCategory) return true;
  if (isSitniGroup(requestCategory) && isSitniGroup(workerCategoryName)) return true;
  if (requestCategory === "Moler") {
    return workerCategoryName === "Moler" || workerCategoryName === "Moler / gipsar";
  }
  if (requestCategory === "Gipsar") {
    return workerCategoryName === "Gipsar" || workerCategoryName === "Moler / gipsar";
  }
  if (requestCategory === "Moler / gipsar") {
    return workerCategoryName === "Moler" || workerCategoryName === "Gipsar" || workerCategoryName === "Moler / gipsar";
  }
  return false;
}

export function workerHasCategoryForRequest(
  workerCategoryNames: string[],
  requestCategory: string
): boolean {
  return workerCategoryNames.some((w) => workerCategoryMatchesRequest(w, requestCategory));
}

/**
 * Svi Category.name vrijednosti koje treba uključiti u distribuciji za dati request.category
 */
export function dbCategoryNamesForDistributionFilter(requestCategory: string): string[] {
  if (requestCategory === REQUEST_CATEGORY_FALLBACK) {
    return [REQUEST_CATEGORY_FALLBACK];
  }
  if (isSitniGroup(requestCategory)) {
    return [...SITNI_GROUP];
  }
  if (requestCategory === "Moler") {
    return ["Moler", "Moler / gipsar"];
  }
  if (requestCategory === "Gipsar") {
    return ["Gipsar", "Moler / gipsar"];
  }
  if (requestCategory === "Moler / gipsar") {
    return ["Moler", "Gipsar", "Moler / gipsar"];
  }
  return [requestCategory];
}

export function getCategoryBySlug(slug: string): CategoryConfig | null {
  return CATEGORY_CONFIG_FULL.find((c) => c.slug === slug) ?? null;
}

/** Stari marketing / SEO nazivi -> internal (deep link kompatibilnost) */
const LEGACY_DISPLAY_ALIASES: Record<string, string> = {
  Baštovanstvo: "Dvorište / bašta",
  Fasader: "Fasade / izolacija",
};

export function getInternalCategory(input: string): string | null {
  const normalized = input.trim();
  const fromLegacy = LEGACY_DISPLAY_ALIASES[normalized];
  if (fromLegacy) return fromLegacy;
  const slugKey = normalized
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return (
    SLUG_TO_INTERNAL[slugKey] ??
    SLUG_TO_INTERNAL[normalized] ??
    DISPLAY_TO_INTERNAL[normalized] ??
    (REQUEST_CATEGORIES.includes(normalized as RequestCategoryInternal) ? normalized : null)
  );
}

export function getDisplayName(slug: string): string | null {
  return CATEGORY_SLUGS[slug] ?? null;
}

export function isCategorySlugValid(slug: string): boolean {
  return slug in SLUG_TO_INTERNAL;
}

export function displayLabelForRequestCategory(internalCategory: string): string {
  const s = typeof internalCategory === "string" ? internalCategory : String(internalCategory ?? "");
  if (s === REQUEST_CATEGORY_FALLBACK) {
    return REQUEST_CATEGORY_FALLBACK_DISPLAY;
  }
  const found = CATEGORY_CONFIG_FULL.find((c) => c.internalCategory === s);
  return found?.displayName ?? s;
}
