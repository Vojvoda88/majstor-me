"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
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

  const applyLanguage = (langCode: string) => {
    const target = `/${"sr"}/${langCode}`;
    document.cookie = `googtrans=${target};path=/;max-age=31536000`;
    document.cookie = `googtrans=${target};path=/;domain=.${window.location.hostname};max-age=31536000`;
    setActiveLang(langCode);
    setOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "sr",
          includedLanguages: "en,ru,tr,sr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const googtrans = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("googtrans="))
      ?.split("=")[1];
    if (!googtrans) return;
    const parts = googtrans.split("/");
    const candidate = parts[parts.length - 1];
    if (candidate) setActiveLang(candidate);
  }, []);

  const activeOption =
    languageOptions.find((option) => option.code === activeLang) ?? languageOptions[0];

  return (
    <>
      {/* Jedan jedini widget div — fiksiran u donjem desnom uglu, radi na svim stranicama */}
      <div id="google_translate_element" className="sr-only" />
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
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <style>{`
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        #google_translate_element {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
          clip: rect(0 0 0 0) !important;
          clip-path: inset(50%) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        .goog-te-menu-frame {
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </>
  );
}
