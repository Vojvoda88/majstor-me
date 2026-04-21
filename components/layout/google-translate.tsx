"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "sr",
          includedLanguages: "en,sr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <>
      {/* Jedan jedini widget div — fiksiran u donjem desnom uglu, radi na svim stranicama */}
      <div
        id="google_translate_element"
        className="fixed bottom-20 right-3 z-50"
      />
      <Script
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
      <style>{`
        .goog-te-banner-frame { display: none !important; }
        body { top: 0 !important; }
        .goog-te-gadget-simple {
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          background: white !important;
          cursor: pointer;
        }
        .goog-te-gadget-simple span {
          color: #475569 !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value span {
          color: #0f172a !important;
          font-weight: 500 !important;
        }
        .goog-te-menu-frame {
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </>
  );
}
