"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPushReadyState,
  requestPermissionAndSubscribe,
  type PushReadyState,
} from "@/lib/push-client";

/**
 * Korisnik: uključivanje push obavještenja kada stigne nova ponuda na zahtjev.
 */
export function UserPushNotificationsCard() {
  const [status, setStatus] = useState<PushReadyState | { kind: "loading" }>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  const refresh = useCallback(async () => {
    setStatus(await getPushReadyState(vapid));
  }, [vapid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapid || busy) return;
    setBusy(true);
    setError(null);
    const result = await requestPermissionAndSubscribe(vapid);
    if (!result.ok && result.reason !== "permission_denied") {
      setError(result.message ?? "Greška pri uključivanju obavještenja.");
    }
    await refresh();
    setBusy(false);
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
        Obavještenja na telefonu nisu podešena na serveru. Ako treba uključiti push, kontaktirajte podršku.
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
          Dobij obavještenje na telefon kad majstor pošalje ponudu na tvoj zahtjev. Klik na obavještenje otvara zahtjev.
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
