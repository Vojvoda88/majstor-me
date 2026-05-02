/**
 * Prvi segment URL-a ne smije biti kategorija ako je sistemska ruta (sprečava hvatanje [service]/[city]).
 */
export const SEO_TOP_LEVEL_RESERVED = new Set([
  "admin",
  "api",
  "auth",
  "categories",
  "category",
  "dashboard",
  "grad",
  "handyman",
  "instaliraj",
  "kontakt",
  "login",
  "register",
  "request",
  "forgot-password",
  "verify-email",
  "verify-pending",
  "reset-password",
  "politika-privatnosti",
  "uslovi-koriscenja",
  "kako-radi-korisnici",
  "kako-radi-majstori",
  "problemi",
  "opengraph-image",
  "twitter-image",
  "icon",
  "manifest.webmanifest",
]);

export function isReservedSeoServiceSegment(segment: string): boolean {
  return SEO_TOP_LEVEL_RESERVED.has(segment.toLowerCase());
}
