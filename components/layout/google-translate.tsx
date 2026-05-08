"use client";

import { useEffect, useMemo, useState } from "react";

const LANG_COOKIE = "bm_lang";
type LangCode = "sr" | "en" | "ru" | "tr";

export function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<LangCode>("sr");

  const languageOptions = useMemo(
    () => [
      { code: "sr", label: "Crnogorski", flag: "🇲🇪" },
      { code: "en", label: "English", flag: "🇬🇧" },
      { code: "ru", label: "Русский", flag: "🇷🇺" },
      { code: "tr", label: "Türkçe", flag: "🇹🇷" },
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

  const setPreferredLanguage = (lang: LangCode) => {
    document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000`;
  };

  const readPreferredLanguage = (): LangCode => {
    const candidate = readCookieValue(LANG_COOKIE);
    return candidate === "en" || candidate === "ru" || candidate === "tr" || candidate === "sr"
      ? candidate
      : "sr";
  };

  const resolveOriginalUrl = (): string => {
    const current = new URL(window.location.href);

    // Case 1: translate.google.com wrapper URL with ?u=
    const wrapped = current.searchParams.get("u");
    if (wrapped) {
      try {
        return decodeURIComponent(wrapped);
      } catch {
        return wrapped;
      }
    }

    // Case 2: *.translate.goog domain with _x_tr_url
    const translatedHost = current.searchParams.get("_x_tr_url");
    if (translatedHost) {
      const withProtocol = /^https?:\/\//i.test(translatedHost) ? translatedHost : `https://${translatedHost}`;
      return withProtocol;
    }

    // Case 3: current page is already under *.translate.goog proxy host
    if (current.hostname.endsWith(".translate.goog")) {
      const sourceHostPart = current.hostname.replace(/\.translate\.goog$/i, "");
      const sourceHost = sourceHostPart.replace(/-/g, ".");
      const sourceUrl = new URL(`https://${sourceHost}${current.pathname}`);
      current.searchParams.forEach((value, key) => {
        if (key.startsWith("_x_tr_")) return;
        sourceUrl.searchParams.set(key, value);
      });
      sourceUrl.hash = current.hash;
      return sourceUrl.toString();
    }

    return current.href;
  };

  const redirectForLanguage = (langCode: LangCode) => {
    const originalUrl = resolveOriginalUrl();
    if (langCode === "sr") {
      window.location.assign(originalUrl);
      return;
    }
    const target = `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(
      langCode
    )}&u=${encodeURIComponent(originalUrl)}`;
    window.location.assign(target);
  };

  const applyLanguage = (langCode: LangCode) => {
    setPreferredLanguage(langCode);
    setActiveLang(langCode);
    setOpen(false);
    redirectForLanguage(langCode);
  };

  useEffect(() => {
    setActiveLang(readPreferredLanguage());

    // On Google proxy hosts, remove manifest link to avoid noisy CORS errors.
    if (window.location.hostname.endsWith(".translate.goog")) {
      const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      manifestLink?.remove();
    }
  }, []);

  const activeOption =
    languageOptions.find((option) => option.code === activeLang) ?? languageOptions[0];

  return (
    <div className="fixed bottom-20 right-3 z-50">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Promijeni jezik"
        >
          <span>{activeOption.flag}</span>
          <span>{activeOption.label}</span>
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
                onClick={() => applyLanguage(option.code as LangCode)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  option.code === activeLang ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700"
                }`}
              >
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
