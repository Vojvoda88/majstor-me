"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    __bmGoogleTranslateReady?: boolean;
    __bmGoogleTranslateInitialized?: boolean;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
            layout?: number;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

export function GoogleTranslate() {
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("sr");

  const languageOptions = useMemo(
    () => [
      { code: "sr", label: "Crnogorski", flag: "🇲🇪" },
      { code: "en", label: "English", flag: "🇬🇧" },
      { code: "ru", label: "Русский", flag: "🇷🇺" },
      { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    ],
    []
  );

  const hasDomain = typeof window !== "undefined" && window.location.hostname.includes(".");

  const readCookieValue = (name: string): string | null => {
    const raw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${name}=`))
      ?.split("=")[1];
    return raw ? decodeURIComponent(raw) : null;
  };

  const readCookieLanguage = (): string | null => {
    const value = readCookieValue("googtrans");
    if (!value) return null;
    const candidate = value.split("/").at(-1);
    return candidate || null;
  };

  const setTranslateCookie = (value: string) => {
    document.cookie = `googtrans=${value};path=/;max-age=31536000`;
    if (hasDomain) {
      document.cookie = `googtrans=${value};path=/;domain=.${window.location.hostname};max-age=31536000`;
    }
  };

  const clearTranslateCookie = () => {
    document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (hasDomain) {
      document.cookie = `googtrans=;path=/;domain=.${window.location.hostname};expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  const ensureTranslateInitialized = () => {
    if (window.__bmGoogleTranslateInitialized) return;
    if (!window.google?.translate?.TranslateElement) return;
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "sr",
        includedLanguages: "en,ru,tr,sr",
        autoDisplay: false,
      },
      "google_translate_element"
    );
    window.__bmGoogleTranslateInitialized = true;
  };

  const applyViaGoogleSelect = (langCode: string): boolean => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (!select) return false;
    const target = langCode === "sr" ? "" : langCode;
    if (select.value !== target) {
      select.value = target;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return true;
  };

  const redirectViaGoogleTranslate = (langCode: string) => {
    if (langCode === "sr") {
      window.location.href = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
      return;
    }
    const url = window.location.href;
    const translatedUrl = `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(
      langCode
    )}&u=${encodeURIComponent(url)}`;
    window.location.href = translatedUrl;
  };

  const applyLanguage = (langCode: string) => {
    setActiveLang(langCode);
    setOpen(false);

    if (langCode === "sr") {
      clearTranslateCookie();
      const applied = applyViaGoogleSelect("sr");
      if (!applied) window.location.reload();
      return;
    }

    const target = `/auto/${langCode}`;
    setTranslateCookie(target);

    let attempts = 0;
    const maxAttempts = 20;
    const timer = window.setInterval(() => {
      attempts += 1;
      ensureTranslateInitialized();
      const applied = applyViaGoogleSelect(langCode);
      if (applied) {
        window.clearInterval(timer);
        return;
      }
      if (attempts >= maxAttempts) {
        window.clearInterval(timer);
        redirectViaGoogleTranslate(langCode);
      }
    }, 120);
  };

  useEffect(() => {
    const candidate = readCookieLanguage();
    if (candidate) setActiveLang(candidate);

    const applySaved = () => {
      const saved = readCookieLanguage();
      if (!saved || saved === "sr") return;
      applyViaGoogleSelect(saved);
    };

    const t1 = window.setTimeout(() => {
      ensureTranslateInitialized();
      applySaved();
    }, 300);
    const t2 = window.setTimeout(() => {
      ensureTranslateInitialized();
      applySaved();
    }, 900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const activeOption =
    languageOptions.find((option) => option.code === activeLang) ?? languageOptions[0];

  return (
    <>
      {/* Jedan jedini widget div — fiksiran u donjem desnom uglu, radi na svim stranicama */}
      <div id="google_translate_element" />
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
                  onClick={() => applyLanguage(option.code)}
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
      <Script
        src="https://translate.google.com/translate_a/element.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.__bmGoogleTranslateReady = true;
          ensureTranslateInitialized();
          const saved = readCookieLanguage();
          if (saved && saved !== "sr") applyViaGoogleSelect(saved);
        }}
      />
      <style>{`
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        #google_translate_element {
          position: absolute !important;
          left: -9999px !important;
          top: -9999px !important;
          width: 100px !important;
          height: 30px !important;
          overflow: hidden !important;
        }
        .goog-te-menu-frame {
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </>
  );
}
