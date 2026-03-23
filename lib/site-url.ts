/**
 * Canonical / OG / sitemap base URL (SEO).
 * Production source of truth: https://www.brzimajstor.me
 *
 * - Prefer `NEXT_PUBLIC_SITE_URL` (set to https://www.brzimajstor.me in production).
 * - Never use `*.vercel.app` (preview or deployment URL) as canonical — falls back to www.
 */
const DEFAULT_SITE_URL = "https://www.brzimajstor.me";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }
  if (process.env.NEXTAUTH_URL) {
    return stripTrailingSlash(process.env.NEXTAUTH_URL);
  }
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.toLowerCase();
    if (host.endsWith(".vercel.app")) {
      return DEFAULT_SITE_URL;
    }
    return stripTrailingSlash(`https://${process.env.VERCEL_URL}`);
  }
  return DEFAULT_SITE_URL;
}
