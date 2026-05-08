"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, getLocaleFromPathname, normalizeLocale, type AppLocale } from "@/lib/i18n/config";

export type UiLanguage = AppLocale;

function readLanguageCookie(): UiLanguage | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  if (!cookie) return null;
  return normalizeLocale(decodeURIComponent(cookie));
}

function readHtmlLanguage(): UiLanguage {
  if (typeof document === "undefined") return "sr" as UiLanguage;
  return normalizeLocale(document.documentElement.lang);
}

export function detectUiLanguage(pathname?: string): UiLanguage {
  if (pathname) {
    const fromPath = getLocaleFromPathname(pathname);
    if (fromPath) return fromPath;
  }
  return readLanguageCookie() ?? readHtmlLanguage();
}

export function useUiLanguage(): UiLanguage {
  const pathname = usePathname();
  const [language, setLanguage] = useState<UiLanguage>("sr");

  useEffect(() => {
    const update = () => setLanguage(detectUiLanguage(pathname));
    update();
    window.addEventListener("focus", update);
    return () => window.removeEventListener("focus", update);
  }, [pathname]);

  return language;
}
