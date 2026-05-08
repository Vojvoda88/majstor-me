export const SUPPORTED_LOCALES = ["sr", "en", "ru", "tr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "sr";
export const LOCALE_COOKIE = "bm_lang";
export const LOCALE_HEADER = "x-bm-locale";

export const STATIC_PATH_PREFIXES = [
  "/_next",
  "/api",
  "/admin",
  "/dashboard",
  "/favicon",
  "/icon",
  "/apple-touch-icon",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
] as const;

const PUBLIC_FILE_REGEX = /\.[a-z0-9]+$/i;

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  if (!value) return false;
  return (SUPPORTED_LOCALES as readonly string[]).includes(value.toLowerCase());
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.toLowerCase();
  if (isSupportedLocale(lower)) return lower;
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ru")) return "ru";
  if (lower.startsWith("tr")) return "tr";
  return DEFAULT_LOCALE;
}

export function getLocaleFromPathname(pathname: string): AppLocale | null {
  const first = pathname.split("/").filter(Boolean)[0] ?? null;
  return isSupportedLocale(first) ? first : null;
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return stripped.length > 0 ? stripped : "/";
}

export function withLocalePrefix(pathname: string, locale: AppLocale): string {
  if (!pathname || pathname === "/") return `/${locale}`;
  if (getLocaleFromPathname(pathname)) return pathname;
  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function isExcludedFromLocaleRouting(pathname: string): boolean {
  if (PUBLIC_FILE_REGEX.test(pathname)) return true;
  return STATIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
