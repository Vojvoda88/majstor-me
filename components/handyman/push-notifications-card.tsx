"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Status =
  | { kind: "loading" }
  | { kind: "unsupported"; reason: string }
  | { kind: "no_vapid" }
  | { kind: "ready"; permission: NotificationPermission; subscribed: boolean };

const INTRO_COPY =
  "Uključite obavještenja da ne propuštate nove poslove.";

const UNAVAILABLE_COPY =
  "Obavještenja na telefonu trenutno nijesu dostupna.";

function NotificationsCardFrame({
  children,
  footer,
}: {
  children?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <h2 className="font-display text-base font-bold text-brand-navy md:text-lg">
              Obavještenja za nove poslove
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{INTRO_COPY}</p>
          {children}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">{footer}</div>
    </div>
  );
}

/**
 * Majstor: eksplicitno uključivanje obavještenja za nove zahtjeve (PWA / preglednik).
 */
export function HandymanPushNotificationsCard() {
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!vapid) {
      setStatus({ kind: "no_vapid" });
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus({
        kind: "unsupported",
        reason:
          "Na ovom pregledniku obavještenja nisu podržana. Probajte u Chrome ili Edge na telefonu, ili dodajte sajt na početni ekran (npr. iPhone).",
      });
      return;
    }
    if (!("Notification" in window)) {
      setStatus({
        kind: "unsupported",
        reason: UNAVAILABLE_COPY,
      });
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus({
        kind: "ready",
        permission: Notification.permission,
        subscribed: !!sub,
      });
    } catch {
      setStatus({
        kind: "unsupported",
        reason: "Obavještenja nisu moguće uključiti sada. Pokušajte ponovo kasnije.",
      });
    }
  }, [vapid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        await refresh();
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
        });
      }
      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!res.ok) {
        await res.json().catch(() => ({}));
        throw new Error("Podešavanja nisu sačuvana. Pokušajte ponovo.");
      }
      await refresh();
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Nije moguće uključiti obavještenja. Pokušajte ponovo."
      );
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (status.kind === "loading") {
    return (
      <NotificationsCardFrame
        footer={
          <Button type="button" disabled className="w-full touch-manipulation sm:w-auto">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Učitavanje…
          </Button>
        }
      />
    );
  }

  if (status.kind === "unsupported") {
    return (
      <NotificationsCardFrame
        footer={
          <>
            <p className="text-sm text-slate-700 sm:max-w-xl">{status.reason}</p>
            <Button
              type="button"
              disabled
              className="w-full touch-manipulation sm:w-auto"
              aria-disabled="true"
            >
              <Bell className="mr-2 h-4 w-4 opacity-50" aria-hidden />
              Uključi obavještenja
            </Button>
          </>
        }
      />
    );
  }

  if (status.kind === "no_vapid") {
    return (
      <NotificationsCardFrame
        footer={
          <>
            <p className="text-sm text-slate-700">{UNAVAILABLE_COPY}</p>
            <Button
              type="button"
              disabled
              className="w-full touch-manipulation sm:w-auto"
              aria-disabled="true"
              title="Trenutno nije dostupno"
            >
              <Bell className="mr-2 h-4 w-4 opacity-50" aria-hidden />
              Uključi obavještenja
            </Button>
          </>
        }
      />
    );
  }

  const { permission, subscribed } = status;
  const enabled = permission === "granted" && subscribed;

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
            <h2 className="font-display text-base font-bold text-brand-navy md:text-lg">
              Obavještenja za nove poslove
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{INTRO_COPY}</p>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {enabled ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Obavještenja su uključena za ovaj uređaj
          </p>
        ) : permission === "denied" ? (
          <p className="text-sm text-amber-900">
            Dozvola za obavještenja je odbijena. U podešavanjima preglednika možete je ponovo uključiti za ovaj sajt.
          </p>
        ) : (
          <Button
            type="button"
            onClick={() => void handleEnable()}
            disabled={busy}
            className="w-full touch-manipulation sm:w-auto"
          >
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Učitavanje…
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" aria-hidden />
                Uključi obavještenja
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
