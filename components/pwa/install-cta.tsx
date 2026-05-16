"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, Download, X } from "lucide-react";
import { fetchPublicVapidServerKey, requestPermissionAndSubscribe } from "@/lib/push-client";
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
  const { data: session, status } = useSession();
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  const [notifDone, setNotifDone] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const [hasInstalledRelatedApp, setHasInstalledRelatedApp] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const [vapidPublicKey, setVapidPublicKey] = useState<string | undefined>(() =>
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() : undefined
  );

  useEffect(() => {
    let cancelled = false;
    void fetchPublicVapidServerKey().then((k) => {
      if (!cancelled && k) setVapidPublicKey(k);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleNotifications = useCallback(async () => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    const key = vapidPublicKey || (await fetchPublicVapidServerKey());
    if (!key) return;

    setNotifBusy(true);
    try {
      const result = await requestPermissionAndSubscribe(key);
      if (result.ok) setNotifDone(true);
    } catch {
      /* denied or error */
    } finally {
      setNotifBusy(false);
    }
  }, [session?.user, vapidPublicKey]);

  const close = () => {
    setVisible(false);
  };

  if (!visible) return null;
  if (isStandalone()) return null;
  if (hasInstalledRelatedApp) return null;

  const showNotifRow = status === "authenticated";
  const loggedIn = !!(session?.user as { id?: string } | undefined)?.id;
  const isHandyman = session?.user?.role === "HANDYMAN";
  const isAdmin = session?.user?.role === "ADMIN";
  const canPush = !!vapidPublicKey && typeof window !== "undefined" && "PushManager" in window;

  return (
    <>
      {/*
        Pozadina je samo vizuelna — BEZ pointer-events. Inače full-screen sloj (z-90)
        prekriva cijelu stranicu i „pojede” sve klikove (linkovi, dugmad) — korisnik misli
        da ništa ne radi dok ne zatvori modal. Zatvaranje: X ili „Kasnije”.
      */}
      <div
        className="pointer-events-none fixed inset-0 z-[90] bg-black/20 backdrop-blur-[1px] md:bg-black/10"
        aria-hidden
      />
      <div
        className="pointer-events-auto fixed bottom-[max(0.6rem,env(safe-area-inset-bottom))] left-1/2 z-[95] w-[min(90vw,20rem)] -translate-x-1/2 rounded-xl border border-slate-200/90 bg-white p-3 shadow-xl sm:w-[min(90vw,21rem)] sm:p-3.5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-entry-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="pwa-entry-title" className="font-display text-[15px] font-bold tracking-tight text-brand-navy sm:text-base">
              {t(locale, "pwa.installTitle", "Preuzmi aplikaciju")}
            </h2>
            <p className="mt-1 text-[12px] leading-snug text-slate-600 sm:text-[13px]">
              {t(locale, "pwa.installBody", "Ikonica na početnom ekranu i obavještenja o ponudama i zahtjevima.")}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={t(locale, "common.buttons.close", "Zatvori")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {installReady ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 py-2.5 text-[14px] font-bold text-white shadow-md transition hover:bg-[#1D4ED8] disabled:opacity-70"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {installing ? t(locale, "common.loading", "Čekaj…") : t(locale, "pwa.install", "Instaliraj aplikaciju")}
            </button>
          ) : (
            <Link
              href="/instaliraj"
              className="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-bold text-brand-navy transition hover:bg-slate-100"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {t(locale, "pwa.iosStepsTitle", "Kako instalirati na iPhone")} / {t(locale, "pwa.androidStepsTitle", "Kako instalirati na Android")}
            </Link>
          )}

          {showNotifRow && (
            <>
              {loggedIn && (isHandyman || isAdmin) && canPush ? (
                <button
                  type="button"
                  onClick={handleNotifications}
                  disabled={notifBusy || notifDone}
                  className="flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-[14px] font-semibold text-amber-950 transition hover:bg-amber-100 disabled:opacity-80"
                >
                  <Bell className="h-4 w-4 shrink-0" aria-hidden />
                  {notifDone
                    ? t(locale, "push.enabled", "Obavještenja su uključena")
                    : notifBusy
                      ? t(locale, "common.loading", "Čekaj…")
                      : isAdmin
                        ? t(locale, "push.enable", "Primaj push obavještenja (admin)")
                        : t(locale, "push.enable", "Primaj obavještenja za nove poslove")}
                </button>
              ) : loggedIn && !isHandyman && !isAdmin ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-600">
                  {t(locale, "pwa.notifForHandymanOnly", "Obavještenja o novim poslovima dostupna su u dashboardu majstora nakon prijave kao majstor.")}
                </p>
              ) : (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-500">
                  {t(locale, "pwa.pushUnavailable", "Push obavještenja trenutno nisu dostupna u ovom okruženju (konfiguracija).")}
                </p>
              )}
            </>
          )}
        </div>

        {loggedIn && (isHandyman || isAdmin) && (
          <p className="mt-2.5 text-center text-[11px] leading-snug text-slate-500">
            {t(locale, "pwa.enableLaterPrefix", "Kasnije možete uključiti push u")}{" "}
            {isAdmin ? (
              <>
                <Link href="/admin" className="font-medium text-slate-700 underline-offset-2 hover:underline">
                  {t(locale, "pwa.adminArea", "administraciji")}
                </Link>{" "}
                {t(locale, "pwa.orIn", "ili u")}{" "}
                <Link
                  href="/admin/notifications"
                  className="font-medium text-slate-700 underline-offset-2 hover:underline"
                >
                  {t(locale, "pwa.notificationsArea", "obavještenjima")}
                </Link>
                .
              </>
            ) : (
              <Link
                href="/dashboard/handyman"
                className="font-medium text-slate-700 underline-offset-2 hover:underline"
              >
                {t(locale, "pwa.handymanArea", "dijelu za majstore")}
              </Link>
            )}
          </p>
        )}

        <button
          type="button"
          onClick={close}
          className="mt-2 w-full py-1.5 text-center text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
        >
          {t(locale, "pwa.later", "Kasnije")}
        </button>
      </div>
    </>
  );
}
