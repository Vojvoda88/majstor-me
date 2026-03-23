"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPushUiState,
  requestPermissionAndSubscribe,
  type PushUiState,
} from "@/lib/push-client";
import { IOS_PWA_PUSH_HINT, isLikelyIOSDevice } from "@/lib/push-ui-copy";

const UI_MODE_KEY = "bm_admin_push_ui_mode";

type UiMode = "full" | "compact";

function getUiMode(): UiMode {
  if (typeof window === "undefined") return "full";
  try {
    const m = localStorage.getItem(UI_MODE_KEY);
    if (m === "compact" || m === "full") return m;
  } catch {
    /* ignore */
  }
  return "full";
}

function setUiMode(mode: UiMode): void {
  try {
    localStorage.setItem(UI_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * Admin: naknadno uključivanje push-a (pending zahtjevi/majstori). Uvijek dostupan put na dashboardu / notifikacije.
 */
export function AdminPushEntryCard() {
  const [status, setStatus] = useState<PushUiState | { kind: "loading" }>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uiMode, setUiModeState] = useState<UiMode>("full");

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;

  const refresh = useCallback(async () => {
    const s = await getPushUiState(vapid);
    setStatus(s);
  }, [vapid]);

  useEffect(() => {
    setUiModeState(getUiMode());
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapid || busy) return;
    setBusy(true);
    setError(null);
    const result = await requestPermissionAndSubscribe(vapid);
    if (!result.ok && result.reason !== "permission_denied") {
      setError(result.message ?? "Nije moguće uključiti obavještenja. Pokušajte ponovo.");
    }
    await refresh();
    setBusy(false);
  };

  const handleLater = () => {
    setUiMode("compact");
    setUiModeState("compact");
  };

  if (status.kind === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          <p className="text-sm font-semibold text-emerald-900">
            Push obavještenja su uključena na ovom uređaju — dobićete obavještenje za nove stvari koje čekaju pregled.
          </p>
        </div>
      </div>
    );
  }

  if (status.kind === "unsupported") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm leading-relaxed text-slate-800">{status.reason}</p>
        {isLikelyIOSDevice() && (
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{IOS_PWA_PUSH_HINT}</p>
        )}
      </div>
    );
  }

  if (status.kind === "no_vapid") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
        Push na serveru nije podešen (nedostaje javni ključ). Kontaktirajte podršku za produkciju.
      </div>
    );
  }

  const { permission } = status;
  const showCompact = uiMode === "compact";

  if (showCompact) {
    return (
      <div className="rounded-xl border-2 border-amber-200/90 bg-amber-50/95 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-950">Obavještenja nisu uključena</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                Uključite push da brže vidite nove zahtjeve i prijave koje čekaju pregled.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-amber-600 font-semibold text-white hover:bg-amber-700"
              disabled={busy || permission === "denied"}
              onClick={() => void handleEnable()}
            >
              {busy ? "Čekaj…" : "Uključi obavještenja"}
            </Button>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-900 underline-offset-2 hover:underline"
              onClick={() => {
                setUiMode("full");
                setUiModeState("full");
              }}
            >
              Prikaži više
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-white to-slate-50/80 p-4 shadow-md md:p-5">
      <div className="flex items-start gap-2">
        <Bell className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-brand-navy md:text-lg">Push za admin panel</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            Uključite obavještenja da odmah vidite nove zahtjeve i prijave majstora koje čekaju pregled. Možete ih kasnije
            isključiti u podešavanjima preglednika za ovaj sajt.
          </p>
        </div>
      </div>

      {permission === "denied" && (
        <p className="mt-3 text-sm font-medium text-red-900">
          Dozvola je odbijena. Podešavanja preglednika → ovaj sajt → dozvoli obavještenja, pa pokušajte ponovo.
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          onClick={() => void handleEnable()}
          disabled={busy || permission === "denied"}
          size="lg"
          className="w-full bg-amber-600 font-bold text-white hover:bg-amber-700 sm:w-auto"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
              Čekaj…
            </>
          ) : (
            <>
              <Bell className="mr-2 h-5 w-5" aria-hidden />
              Uključi push obavještenja
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={handleLater}
          disabled={busy}
          className="w-full py-2 text-center text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline sm:w-auto sm:px-4"
        >
          Kasnije
        </button>
      </div>
    </div>
  );
}
