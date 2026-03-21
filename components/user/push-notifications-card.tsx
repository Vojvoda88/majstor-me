"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
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

/**
 * Korisnik: uključivanje obavještenja na telefonu kada stigne nova ponuda na vaš zahtjev (PWA).
 */
export function UserPushNotificationsCard() {
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
        reason: "Ovaj preglednik ne podržava obavještenja na telefonu na ovaj način. Koristite Chrome ili Edge na Androidu, ili Safari na iPhoneu (aplikacija sa početnog ekrana).",
      });
      return;
    }
    if (!("Notification" in window)) {
      setStatus({ kind: "unsupported", reason: "Obavještenja nisu dostupna u ovom okruženju." });
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
      setStatus({ kind: "unsupported", reason: "Nije moguće provjeriti pretplatu. Pokušajte ponovo kasnije." });
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
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Pretplata nije sačuvana");
      }
      await refresh();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Greška pri uključivanju obavještenja.");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (status.kind === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Provjera obavještenja…
        </div>
      </div>
    );
  }

  if (status.kind === "unsupported") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 text-sm text-slate-700">
        <div className="flex gap-2">
          <BellOff className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          <p>{status.reason}</p>
        </div>
      </div>
    );
  }

  if (status.kind === "no_vapid") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
        Obavještenja na telefonu nisu podešena na serveru. Kontaktirajte podršku ako treba uključiti.
      </div>
    );
  }

  const { permission, subscribed } = status;
  const enabled = permission === "granted" && subscribed;

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-4 shadow-sm md:p-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
          <h2 className="font-display text-base font-bold text-brand-navy md:text-lg">Obavještenja o novim ponudama</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Dobijte obavještenje na telefon kada majstor pošalje ponudu na vaš zahtjev. Klik otvara taj zahtjev da odmah
          vidite ponudu.
        </p>
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
