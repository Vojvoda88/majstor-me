"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  forceResubscribe,
  getCurrentPushSubscriptionEndpoint,
  getPushUiState,
  requestPermissionAndSubscribe,
  type PushUiState,
} from "@/lib/push-client";
import { IOS_PWA_PUSH_HINT, isLikelyIOSDevice } from "@/lib/push-ui-copy";

const UI_MODE_KEY = "bm_handyman_push_ui_mode";
/** Legacy: 7 dana skrivanja — migriramo u compact umjesto trajnog nestajanja */
const LEGACY_DISMISS_UNTIL_KEY = "bm_handyman_push_dismiss_until_ms";

type UiMode = "full" | "compact";

function migrateLegacyDismiss(): void {
  try {
    const raw = localStorage.getItem(LEGACY_DISMISS_UNTIL_KEY);
    if (!raw) return;
    const until = parseInt(raw, 10);
    if (!isNaN(until) && Date.now() < until) {
      localStorage.setItem(UI_MODE_KEY, "compact");
    }
    localStorage.removeItem(LEGACY_DISMISS_UNTIL_KEY);
  } catch {
    /* ignore */
  }
}

function getUiMode(): UiMode {
  if (typeof window === "undefined") return "full";
  try {
    migrateLegacyDismiss();
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

const TITLE = "Ne propusti nove zahtjeve";
const BODY =
  "Uključite obavještenja na ovom uređaju: čim stigne posao koji odgovara vašoj usluci i gradu, dobijate push i možete odmah otvoriti zahtjev.";

/**
 * Majstor: eksplicitno uključivanje push obavještenja. Nakon „Kasnije“ ostaje vidljiv kompaktan blok (nije „jedna šansa“).
 */
export function HandymanPushNotificationsCard() {
  const [status, setStatus] = useState<PushUiState | { kind: "loading" }>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [uiMode, setUiModeState] = useState<UiMode>("full");
  const [selfHealTried, setSelfHealTried] = useState(false);

  const vapid = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY : undefined;
  const REQUEST_TIMEOUT_MS = 15_000;

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = window.setTimeout(() => {
        reject(new Error("request_timeout"));
      }, timeoutMs);
      promise.then(
        (value) => {
          window.clearTimeout(id);
          resolve(value);
        },
        (error) => {
          window.clearTimeout(id);
          reject(error);
        }
      );
    });
  };

  const refresh = useCallback(async () => {
    const s = await getPushUiState(vapid);
    setStatus(s);
  }, [vapid]);

  const toUiError = (e: unknown): string => {
    if (e instanceof Error) {
      if (e.message === "request_timeout") {
        return "Traje predugo. Ako vidite dugme „Ažuriraj“ za aplikaciju, kliknite ga i pokušajte ponovo.";
      }
      if (e.message?.trim()) return e.message;
    }
    return "Greška pri uključivanju obavještenja. Pokušajte ponovo.";
  };

  useEffect(() => {
    setUiModeState(getUiMode());
    void refresh();
  }, [refresh]);

  const handleEnable = async () => {
    if (!vapid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await withTimeout(requestPermissionAndSubscribe(vapid));
      if (!result.ok) {
        if (result.reason === "permission_denied") {
          setError(null);
        } else {
          setError(result.message ?? "Nije moguće uključiti obavještenja. Pokušajte ponovo.");
        }
      }
      await refresh();

      // Jedan klik: odmah testiraj baš ovaj uređaj.
      const runDeviceTest = async () => {
        const endpoint = await getCurrentPushSubscriptionEndpoint();
        const testRes = await withTimeout(
          fetch("/api/push/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(endpoint ? { endpoint } : {}),
          })
        );
        const testJson = await testRes.json().catch(() => ({}));
        return { ok: !!(testRes.ok && testJson?.success), error: typeof testJson?.error === "string" ? testJson.error : null };
      };

      let deviceTest = { ok: false, error: null as string | null };
      try {
        deviceTest = await runDeviceTest();
      } catch {
        deviceTest = { ok: false, error: null };
      }

      if (!deviceTest.ok) {
        const repaired = await withTimeout(forceResubscribe(vapid));
        if (!repaired.ok && repaired.reason !== "permission_denied") {
          setError(repaired.message ?? "Automatska popravka push pretplate nije uspjela.");
        }
        await refresh();
        try {
          const afterRepair = await runDeviceTest();
          if (afterRepair.ok) {
            setTestMessage("Push je aktiviran na ovom telefonu.");
          } else if (!error) {
            setError(afterRepair.error ?? "Push nije aktiviran za ovaj uređaj. Probajte ponovo.");
          }
        } catch {
          if (!error) setError("Push nije aktiviran za ovaj uređaj. Probajte ponovo.");
        }
      } else {
        setTestMessage("Push je aktiviran na ovom telefonu.");
      }
    } catch (e) {
      console.warn("[handyman-push] enable flow failed", e);
      setError(toUiError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleLater = () => {
    setUiMode("compact");
    setUiModeState("compact");
  };

  const handleSendTest = async () => {
    if (testBusy) return;
    setTestBusy(true);
    setError(null);
    setTestMessage(null);
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setTestMessage("Test obavještenje je poslato. Ako je aplikacija otvorena, vidićete ga odmah i u njoj.");
      } else {
        setError(typeof json?.error === "string" ? json.error : "Test obavještenje nije poslato.");
      }
    } catch {
      setError("Greška pri slanju test obavještenja.");
    } finally {
      setTestBusy(false);
    }
  };

  // Auto self-heal bez ručnih koraka: ako je dozvola grantovana, a push ipak nije "enabled", pokušaj reparaciju jednom.
  useEffect(() => {
    if (selfHealTried || !vapid || busy) return;
    if (status.kind !== "ready") return;
    const shouldHeal =
      status.permission === "granted" &&
      (!status.subscribed || status.serverSubscriptionCount < 1);
    if (!shouldHeal) return;

    let cancelled = false;
    setSelfHealTried(true);
    void (async () => {
      const repaired = await forceResubscribe(vapid);
      if (cancelled) return;
      if (!repaired.ok && repaired.reason !== "permission_denied") {
        setError(repaired.message ?? "Automatska popravka push pretplate nije uspjela.");
      }
      await refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [selfHealTried, status, vapid, busy, refresh]);

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
            Obavještenja su uključena — push stiže kad zahtjev koji vam odgovara uđe u sistem.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
            disabled={testBusy}
            onClick={() => void handleSendTest()}
          >
            {testBusy ? "Slanje testa..." : "Pošalji test obavještenje"}
          </Button>
        </div>
        {testMessage && <p className="mt-2 text-sm text-emerald-900">{testMessage}</p>}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
    );
  }

  if (status.kind === "unsupported") {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="flex items-start gap-2">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-slate-800">{status.reason}</p>
            {isLikelyIOSDevice() && (
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{IOS_PWA_PUSH_HINT}</p>
            )}
          </div>
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
  const showCompact = uiMode === "compact";

  if (showCompact) {
    return (
      <div className="rounded-xl border-2 border-amber-200/90 bg-amber-50/95 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-amber-950">Obavještenja trenutno nijesu uključena</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                Ako želite brže reagovati na nove zahtjeve, uključite obavještenja.
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
              Prikaži ponovo
            </button>
          </div>
        </div>
        {permission === "denied" && (
          <p className="mt-3 text-sm font-medium text-red-900">
            Dozvola je odbijena. Podešavanja preglednika → ovaj sajt → dozvoli obavještenja, pa pokušajte ponovo.
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

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
          Dozvola za obavještenja je odbijena. Na telefonu: Podešavanja preglednika → ovaj sajt → dozvoli obavještenja, pa
          se vratite ovdje i pokušajte ponovo.
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
