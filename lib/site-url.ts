/**
 * Canonical / OG / sitemap base URL (SEO).
 * Production source of truth: https://www.brzimajstor.me
 *
 * - `NEXT_PUBLIC_SITE_URL` / `NEXTAUTH_URL` se koriste ako su postavljeni,
 *   ali NIKAD ne smiju proći `*.vercel.app` (česta greška na Vercelu) — tada se ignorišu i koristi www.
 * - Apex `brzimajstor.me` u env-u se normalizuje na `https://www.brzimajstor.me` (kanonski www).
 */

const DEFAULT_SITE_URL = "https://www.brzimajstor.me";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Vraća true za deployment host tipa *.vercel.app (preview ili production deployment URL). */
function isVercelAppHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(".vercel.app");
}

/**
 * Ako je env slučajno postavljen na Vercel deployment URL ili pogrešan host,
 * ne koristiti ga za sitemap/canonical — vrati null da se proba sljedeći izvor ili default.
 */
function urlFromEnvIfAllowed(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const trimmed = stripTrailingSlash(raw.trim());
  try {
    const { hostname } = new URL(trimmed);
    const h = hostname.toLowerCase();
    if (isVercelAppHost(h)) {
      return null;
    }
    if (h === "brzimajstor.me") {
      return DEFAULT_SITE_URL;
    }
    return trimmed;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const fromPublic = urlFromEnvIfAllowed(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromPublic) return fromPublic;

  const fromAuth = urlFromEnvIfAllowed(process.env.NEXTAUTH_URL);
  if (fromAuth) return fromAuth;

  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.toLowerCase();
    if (isVercelAppHost(host)) {
      return DEFAULT_SITE_URL;
    }
    return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }

  return DEFAULT_SITE_URL;
}
