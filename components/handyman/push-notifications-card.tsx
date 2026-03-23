"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPushUiState,
  requestPermissionAndSubscribe,
  type PushUiState,
} from "@/lib/push-client";

const DISMISS_UNTIL_KEY = "bm_handyman_push_dismiss_until_ms";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(DISMISS_UNTIL_KEY);
    if (!raw) return false;
    const until = parseInt(raw, 10);
    return !isNaN(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + DISMISS_MS));
  } catch {
    /* ignore */
  }
}

const TITLE = "Ne propusti nove zahtjeve";
const BODY =
  "Uključi obavještenja na ovom telefonu — čim se pojavi posao koji odgovara tvojoj usluci i gradu, dobijaš obavještenje. Možeš odmah otvoriti zahtjev i poslati ponudu.";

/**
 * Majstor: eksplicitno uključivanje push obavještenja (nakon klika, ne automatski).
 */
export function HandymanPushNotificationsCard() {
  const [status, setStatus] = useState<PushUiState | { kind: "loading" }>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissedState] = useState(false);

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  const refresh = useCallback(async () => {
    const s = await getPushUiState(vapid);
    setStatus(s);
  }, [vapid]);

  useEffect(() => {
    setDismissedState(isDismissed());
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapid || busy) return;
    setBusy(true);
    setError(null);
    const result = await requestPermissionAndSubscribe(vapid);
    if (!result.ok) {
      if (result.reason === "permission_denied") {
        setError(null);
      } else {
        setError(result.message ?? "Nije moguće uključiti obavještenja. Pokušajte ponovo.");
      }
    }
    await refresh();
    setBusy(false);
  };

  const handleLater = () => {
    setDismissed();
    setDismissedState(true);
  };

  if (status.kind === "loading") {
    return (
      <div
        className="rounded-2xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-50 via-white to-amber-50/80 p-4 shadow-md md:p-5"
        aria-busy="true"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-amber-950">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-700" aria-hidden />
          Provjera obavještenja…
        </div>
      </div>
    );
  }

  const enabled =
    status.kind === "ready" &&
    status.permission === "granted" &&
    status.subscribed &&
    status.serverSubscriptionCount > 0;

  if (enabled) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          <p className="text-sm font-semibold text-emerald-900">
            Obavještenja su uključena — šaljemo ti push kada stigne novi zahtjev koji ti odgovara (nakon što zahtjev prođe
            u sistem).
          </p>
        </div>
      </div>
    );
  }

  if (dismissed && status.kind === "ready" && !enabled) {
    return (
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.removeItem(DISMISS_UNTIL_KEY);
          } catch {
            /* ignore */
          }
          setDismissedState(false);
        }}
        className="w-full rounded-lg border border-dashed border-amber-300/80 bg-amber-50/50 px-3 py-2 text-left text-sm font-medium text-amber-900 hover:bg-amber-50"
      >
        Želiš uključiti obavještenja za nove poslove? <span className="underline">Prikaži ponovo</span>
      </button>
    );
  }

  if (status.kind === "unsupported") {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="flex items-start gap-2">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          <p className="text-sm leading-relaxed text-slate-800">{status.reason}</p>
        </div>
      </div>
    );
  }

  if (status.kind === "no_vapid") {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/90 p-4 md:p-5">
        <p className="text-sm text-amber-950">
          Push obavještenja nisu podešena na serveru (nedostaje javni ključ). Kontaktirajte podršku da se uključi za
          produkciju.
        </p>
      </div>
    );
  }

  const { permission } = status;

  return (
    <div className="rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-50 via-white to-orange-50/90 p-4 shadow-lg ring-1 ring-amber-400/30 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 shrink-0 text-amber-600" aria-hidden />
            <h2 className="font-display text-lg font-bold tracking-tight text-brand-navy md:text-xl">{TITLE}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-800 md:text-[15px]">{BODY}</p>
        </div>
      </div>

      {permission === "denied" && (
        <p className="mt-3 text-sm font-medium text-red-900">
          Dozvola za obavještenja je odbijena. Na telefonu: Podešavanja preglednika → ovaj sajt → dozvoli obavještenja,
          pa se vrati ovdje i pokušaj ponovo.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          onClick={() => void handleEnable()}
          disabled={busy || permission === "denied"}
          size="lg"
          className="w-full touch-manipulation bg-amber-600 text-[15px] font-bold text-white hover:bg-amber-700 sm:w-auto sm:min-w-[240px]"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Čekaj…
            </>
          ) : (
            <>
              <Bell className="mr-2 h-5 w-5" aria-hidden />
              Uključi obavještenja za nove poslove
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={handleLater}
          disabled={busy}
          className="w-full touch-manipulation py-3 text-center text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline sm:w-auto sm:px-4"
        >
          Kasnije
        </button>
      </div>
    </div>
  );
}
