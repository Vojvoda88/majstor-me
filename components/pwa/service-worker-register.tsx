"use client";

import { useEffect, useState } from "react";

/**
 * Minimal SW registration – radi na svim stranicama (uključujući javne).
 * Potreban za PWA installability: Chrome zahtijeva registriran SW.
 * Push subscription ostaje u PwaProvider (samo dashboard/admin/request).
 */
export function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    let mounted = true;

    const onControllerChange = () => {
      // Nakon "Ažuriraj" klik-a i preuzimanja kontrole, osvježi app.
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (!mounted) return;

        // Ako update već čeka aktivaciju.
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(registration.waiting ?? newWorker);
            }
          });
        });

        // Periodično provjeri update (npr. poslije deploy-a).
        window.setTimeout(() => {
          void registration.update();
        }, 8000);
      })
      .catch(() => {});

    return () => {
      mounted = false;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!waitingWorker) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[120] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-2xl">
      <p className="text-sm font-medium text-slate-800">Dostupna je nova verzija aplikacije.</p>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          onClick={() => setWaitingWorker(null)}
        >
          Kasnije
        </button>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={applyUpdate}
        >
          Ažuriraj
        </button>
      </div>
    </div>
  );
}
