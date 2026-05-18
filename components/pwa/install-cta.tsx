"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, X } from "lucide-react";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import { t } from "@/lib/i18n/messages";

const SHOW_DELAY_MS = 1600;

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: string }>;
  userChoice: Promise<{ outcome: string }>;
}

/**
 * Mali prozor pri ulasku: preuzmi PWA + opcija obavještenja (push za prijavljene).
 * iOS: nema beforeinstallprompt — i dalje se prikaže sa linkom na uputstva.
 */
export function InstallCTA() {
  const locale = useUiLanguage();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const [hasInstalledRelatedApp, setHasInstalledRelatedApp] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<unknown>>;
    };
    if (typeof nav.getInstalledRelatedApps !== "function") return;
    void nav
      .getInstalledRelatedApps()
      .then((apps) => {
        if (!cancelled && Array.isArray(apps) && apps.length > 0) {
          setHasInstalledRelatedApp(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (hasInstalledRelatedApp) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setInstallReady(true);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    const timer = window.setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    const onInstalled = () => {
      deferredPrompt.current = null;
      setInstallReady(false);
      setVisible(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
      deferredPrompt.current = null;
      setInstallReady(false);
    } catch {
      /* cancelled */
    } finally {
      setVisible(false);
      setInstalling(false);
    }
  };

  const close = () => {
    setVisible(false);
  };

  if (!visible) return null;
  if (isStandalone()) return null;
  if (hasInstalledRelatedApp) return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-[95] w-[min(92vw,18.5rem)] -translate-x-1/2 rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg sm:left-auto sm:right-4 sm:w-72 sm:translate-x-0"
        role="dialog"
        aria-modal="false"
        aria-labelledby="pwa-entry-title"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 id="pwa-entry-title" className="font-display text-[14px] font-bold tracking-tight text-brand-navy sm:text-[15px]">
              {t(locale, "pwa.installTitle", "Preuzmi aplikaciju")}
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-[12px]">
              {t(locale, "pwa.installBody", "Dodajte aplikaciju na početni ekran za brži pristup.")}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={t(locale, "common.buttons.close", "Zatvori")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5">
          {installReady ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex min-h-[40px] w-full touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-[13px] font-bold text-white shadow-md transition hover:bg-[#1D4ED8] disabled:opacity-70"
            >
              <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {installing ? t(locale, "common.loading", "Čekaj…") : t(locale, "pwa.install", "Instaliraj aplikaciju")}
            </button>
          ) : (
            <Link
              href="/instaliraj"
              className="flex min-h-[40px] w-full touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-bold text-brand-navy transition hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {t(locale, "pwa.install", "Instaliraj aplikaciju")}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
