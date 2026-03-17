"use client";

import { useEffect } from "react";

/**
 * Minimal SW registration – radi na svim stranicama (uključujući javne).
 * Potreban za PWA installability: Chrome zahtijeva registriran SW.
 * Push subscription ostaje u PwaProvider (samo dashboard/admin/request).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
