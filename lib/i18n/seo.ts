import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALE_HEADER, SUPPORTED_LOCALES, normalizeLocale } from "@/lib/i18n/config";

export function getLocaleFromHeaderValue(headerValue: string | null | undefined) {
  return normalizeLocale(headerValue);
}

export function localizedPath(path: string, locale: string) {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildAlternates(baseUrl: string, path: string, activeLocale: string): NonNullable<Metadata["alternates"]> {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${cleanBase}${localizedPath(path, locale)}`])
  );

  return {
    // Kanonski URL držimo na default jeziku da smanjimo duplicate-canonical slučajeve u GSC.
    canonical: `${cleanBase}${localizedPath(path, DEFAULT_LOCALE)}`,
    languages: {
      ...languages,
      "x-default": `${cleanBase}${localizedPath(path, DEFAULT_LOCALE)}`,
    },
  };
}

export { LOCALE_HEADER };
