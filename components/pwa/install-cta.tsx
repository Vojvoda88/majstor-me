"use client";

import { useEffect, useState, useRef } from "react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_HOURS = 24;

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: string }>;
  userChoice: Promise<{ outcome: string }>;
}

export function InstallCTA() {
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (isDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const onInstalled = () => {
      deferredPrompt.current = null;
      setShow(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    setIsInstalling(true);
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        deferredPrompt.current = null;
      }
    } catch {
      // User cancelled or error
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-lg sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm"
      role="dialog"
      aria-label="Instaliraj aplikaciju"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#0F172A]">
          Dodaj Majstor.me na početni ekran
        </p>
        <p className="mt-0.5 text-xs text-[#64748B]">
          Brži pristup bez otvaranja browsera
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalling}
          className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#1D4ED8] disabled:opacity-70"
        >
          {isInstalling ? "..." : "Instaliraj"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Zatvori"
          className="rounded p-1 text-[#94A3B8] transition hover:bg-[#F1F5F9] hover:text-[#64748B]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
