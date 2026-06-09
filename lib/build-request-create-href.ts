import { SLUG_TO_INTERNAL } from "@/lib/categories";
import { isReservedSeoServiceSegment } from "@/lib/seo-reserved-segments";
import { CITY_SLUGS } from "@/lib/slugs";

const HIDDEN_STICKY_CTA_PREFIXES = [
  "/dashboard",
  "/admin",
  "/request",
  "/login",
  "/register",
  "/auth",
  "/verify-email",
  "/verify-pending",
  "/reset-password",
  "/forgot-password",
] as const;

/** Javne stranice gdje sticky CTA nema smisla ili smeta flow-u. */
export function isStickyRequestCtaPath(pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === "/") return true;
  return !HIDDEN_STICKY_CTA_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Pre-fill /request/create iz trenutne javne rute (kategorija, grad). */
export function buildRequestCreateHref(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const params = new URLSearchParams();

  if (segments[0] === "category" && segments[1]) {
    const category = SLUG_TO_INTERNAL[segments[1]];
    if (category) params.set("category", category);
  } else if (segments[0] === "grad" && segments[1]) {
    const city = CITY_SLUGS[segments[1]];
    if (city) params.set("city", city);
  } else if (
    segments.length >= 2 &&
    segments[0] &&
    segments[1] &&
    !isReservedSeoServiceSegment(segments[0])
  ) {
    const category = SLUG_TO_INTERNAL[segments[0]];
    const city = CITY_SLUGS[segments[1]];
    if (category) params.set("category", category);
    if (city) params.set("city", city);
  }

  const qs = params.toString();
  return qs ? `/request/create?${qs}` : "/request/create";
}
