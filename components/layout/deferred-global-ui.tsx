"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ServiceWorkerRegister = dynamic(
  () => import("@/components/pwa/service-worker-register").then((m) => m.ServiceWorkerRegister),
  { ssr: false }
);
const InstallCTA = dynamic(() => import("@/components/pwa/install-cta").then((m) => m.InstallCTA), {
  ssr: false,
});
const LanguageSwitcher = dynamic(
  () => import("@/components/layout/google-translate").then((m) => m.LanguageSwitcher),
  { ssr: false }
);

/**
 * Nije kritično za prvi paint: odlažemo mount globalnih client widgeta dok browser ne uhvati predah.
 * Time smanjujemo JS work u startupu na mobile uređajima.
 */
export function DeferredGlobalUi() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };
    const w = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(activate, { timeout: 1500 });
      return () => {
        cancelled = true;
        if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
      };
    }

    const timer = window.setTimeout(activate, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!ready) return null;
  return (
    <>
      <ServiceWorkerRegister />
      <InstallCTA />
      <LanguageSwitcher />
    </>
  );
}
