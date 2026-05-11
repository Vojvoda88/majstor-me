"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type AppLocale, getLocaleFromPathname, normalizeLocale, withLocalePrefix } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/messages";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<AppLocale>(DEFAULT_LOCALE);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const languageOptions = useMemo(
    () => [
      { code: "sr" as const, flag: "🇲🇪" },
      { code: "en" as const, flag: "🇬🇧" },
      { code: "ru" as const, flag: "🇷🇺" },
      { code: "tr" as const, flag: "🇹🇷" },
    ],
    []
  );

  const readCookieValue = (name: string): string | null => {
    const value = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.split("=")[1];
    return value ? decodeURIComponent(value) : null;
  };

  const setPreferredLanguage = (lang: AppLocale) => {
    document.cookie = `${LOCALE_COOKIE}=${lang};path=/;max-age=31536000`;
  };

  const readPreferredLanguage = (): AppLocale => {
    const candidate = readCookieValue(LOCALE_COOKIE);
    return normalizeLocale(candidate);
  };

  const toLocalizedPath = (langCode: AppLocale) => {
    const barePath = getLocaleFromPathname(pathname) ? pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/" : pathname;
    const prefixed = withLocalePrefix(barePath, langCode);
    const query = searchParams.toString();
    return query ? `${prefixed}?${query}` : prefixed;
  };

  const applyLanguage = (langCode: AppLocale) => {
    setPreferredLanguage(langCode);
    setActiveLang(langCode);
    setOpen(false);
    window.location.assign(toLocalizedPath(langCode));
  };

  useEffect(() => {
    const localeFromPath = getLocaleFromPathname(pathname);
    if (localeFromPath) {
      setActiveLang(localeFromPath);
      setPreferredLanguage(localeFromPath);
      return;
    }
    setActiveLang(readPreferredLanguage());
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const activeOption =
    languageOptions.find((option) => option.code === activeLang) ?? languageOptions[0];

  return (
    <div className="fixed bottom-20 right-3 z-50">
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={t(activeLang, "common.language", "Language")}
        >
          <span>{activeOption.flag}</span>
          <span>{t(activeLang, `common.languages.${activeOption.code}`, activeOption.code.toUpperCase())}</span>
          <span className="text-slate-500">{open ? "▲" : "▼"}</span>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute bottom-12 right-0 min-w-[180px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          >
            {languageOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                role="menuitem"
                onClick={() => applyLanguage(option.code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  option.code === activeLang ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                <span>{option.flag}</span>
                <span>{t(activeLang, `common.languages.${option.code}`, option.code.toUpperCase())}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
