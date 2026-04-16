"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ForegroundPush = {
  title: string;
  body?: string;
  link?: string;
};

/**
 * Minimal SW registration – radi na svim stranicama (uključujući javne).
 * Potreban za PWA installability: Chrome zahtijeva registriran SW.
 * Push subscription ostaje u PwaProvider (samo dashboard/admin/request).
 */
export function ServiceWorkerRegister() {
  const router = useRouter();
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [foregroundPush, setForegroundPush] = useState<ForegroundPush | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    let mounted = true;

    const onControllerChange = () => {
      // Nakon "Ažuriraj" klik-a i preuzimanja kontrole, osvježi app.
      window.location.reload();
    };
    const onSwMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "PUSH_RECEIVED" || !data.payload) return;
      setForegroundPush({
        title: String(data.payload.title ?? "BrziMajstor.ME"),
        body: typeof data.payload.body === "string" ? data.payload.body : "",
        link: typeof data.payload.link === "string" ? data.payload.link : "/",
      });
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker.addEventListener("message", onSwMessage);

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
      navigator.serviceWorker.removeEventListener("message", onSwMessage);
    };
  }, []);

  const applyUpdate = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {foregroundPush && (
        <div className="fixed right-4 top-4 z-[130] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-2xl">
          <p className="text-sm font-semibold text-slate-900">{foregroundPush.title}</p>
          {foregroundPush.body ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{foregroundPush.body}</p>
          ) : null}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              onClick={() => setForegroundPush(null)}
            >
              Zatvori
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() => {
                const target = foregroundPush.link?.trim() || "/";
                setForegroundPush(null);
                router.push(target);
                router.refresh();
              }}
            >
              Otvori
            </button>
          </div>
        </div>
      )}
      {waitingWorker && (
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
      )}
    </>
  );
}
