"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, Download, X } from "lucide-react";
import { requestPermissionAndSubscribe } from "@/lib/push-client";

const DISMISS_KEY = "pwa-entry-modal-dismissed";
/** Koliko dugo ne prikazuj ponovo nakon „Kasnije“ */
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
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

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < DISMISS_MS;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
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
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifDone, setNotifDone] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (isDismissed()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setInstallReady(true);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const t = window.setTimeout(() => {
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
      window.clearTimeout(t);
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
      setInstalling(false);
    }
  };

  const handleNotifications = useCallback(async () => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid || !vapid) return;

    setNotifBusy(true);
    try {
      const result = await requestPermissionAndSubscribe(vapid);
      if (result.ok) setNotifDone(true);
    } catch {
      /* denied or error */
    } finally {
      setNotifBusy(false);
    }
  }, [session?.user, vapid]);

  const close = () => {
    setDismissed();
    setVisible(false);
  };

  if (!visible) return null;
  if (isStandalone()) return null;

  const showNotifRow = status !== "loading";
  const loggedIn = !!(session?.user as { id?: string } | undefined)?.id;
  const isHandyman = session?.user?.role === "HANDYMAN";
  const isAdmin = session?.user?.role === "ADMIN";
  const canPush = !!vapid && typeof window !== "undefined" && "PushManager" in window;

  return (
    <>
      {/*
        Pozadina je samo vizuelna — BEZ pointer-events. Inače full-screen sloj (z-90)
        prekriva cijelu stranicu i „pojede” sve klikove (linkovi, dugmad) — korisnik misli
        da ništa ne radi dok ne zatvori modal. Zatvaranje: X ili „Kasnije”.
      */}
      <div
        className="pointer-events-none fixed inset-0 z-[90] bg-black/35 backdrop-blur-[2px] md:bg-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-auto fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-[95] mx-auto max-w-md rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-entry-title"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 id="pwa-entry-title" className="font-display text-lg font-bold tracking-tight text-brand-navy">
              Preuzmi aplikaciju
            </h2>
            <p className="mt-1 text-sm leading-snug text-slate-600">
              Brži pristup sa početnog ekrana i obavještenja o ponudama i zahtjevima.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {installReady ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-[15px] font-bold text-white shadow-md transition hover:bg-[#1D4ED8] disabled:opacity-70"
            >
              <Download className="h-5 w-5 shrink-0" aria-hidden />
              {installing ? "Čekaj…" : "Instaliraj aplikaciju"}
            </button>
          ) : (
            <Link
              href="/instaliraj"
              onClick={() => setDismissed()}
              className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-bold text-brand-navy transition hover:bg-slate-100"
            >
              <Download className="h-5 w-5 shrink-0" aria-hidden />
              Kako instalirati (iPhone / Android)
            </Link>
          )}

          {showNotifRow && (
            <>
              {loggedIn && (isHandyman || isAdmin) && canPush ? (
                <button
                  type="button"
                  onClick={handleNotifications}
                  disabled={notifBusy || notifDone}
                  className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-[15px] font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-80"
                >
                  <Bell className="h-5 w-5 shrink-0" aria-hidden />
                  {notifDone
                    ? "Obavještenja su uključena"
                    : notifBusy
                      ? "Čekaj…"
                      : isAdmin
                        ? "Primaj push obavještenja (admin)"
                        : "Primaj obavještenja za nove poslove"}
                </button>
              ) : loggedIn && !isHandyman && !isAdmin ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
                  Obavještenja o novim poslovima dostupna su u dashboardu majstora nakon prijave kao majstor.
                </p>
              ) : !loggedIn ? (
                <Link
                  href="/login?callbackUrl=/"
                  className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <Bell className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                  Prijavi se za obavještenja
                </Link>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
                  Push obavještenja trenutno nisu dostupna u ovom okruženju (konfiguracija).
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-3 w-full py-2 text-center text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          Kasnije
        </button>
      </div>
    </>
  );
}
