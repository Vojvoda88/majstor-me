"use client";

import { useCallback, useEffect, useState } from "react";
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

/**
 * Admin: push kada novi profil ili oglas čeka pregled (isti SW + VAPID kao majstori).
 */
export function AdminPushCard() {
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
          "Na ovom pregledniku push nije podržan. Koristite Chrome ili Edge na telefonu i dodajte PWA.",
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
      setStatus({ kind: "unsupported", reason: "Ne možemo pročitati stanje pretplate." });
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
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (!res.ok) throw new Error("Pretplata nije sačuvana.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (status.kind === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Učitavanje…
      </div>
    );
  }
  if (status.kind === "no_vapid" || status.kind === "unsupported") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {status.kind === "unsupported" ? status.reason : "Push nije konfigurisan na serveru (VAPID)."}
      </div>
    );
  }

  const enabled = status.permission === "granted" && status.subscribed;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[#0F172A]">Push na telefon za moderaciju</h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Kratko obavještenje kada novi majstorski profil ili novi oglas čeka pregled. Klik na notifikaciju otvara
            konkretan zapis.
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3">
            {enabled ? (
              <p className="text-sm font-medium text-emerald-700">Push je uključen na ovom uređaju.</p>
            ) : (
              <Button type="button" size="sm" onClick={() => void handleEnable()} disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Čekaj…
                  </>
                ) : (
                  "Uključi push obavještenja"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
