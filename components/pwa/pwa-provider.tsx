"use client";

import { useEffect } from "react";

/**
 * React Query + SW registracija. Push pretplatu za majstore radi eksplicitno
 * `HandymanPushNotificationsCard` (dozvola zahtijeva korisnički gest).
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => reg.update())
        .catch(() => {});
    }

    const handler = (e: Event) => {
      (e as { preventDefault: () => void }).preventDefault();
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return <>{children}</>;
}
