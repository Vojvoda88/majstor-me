/**
 * Klijentska Web Push pretplata (poziva se samo iz browsera, nakon korisničkog klika).
 */

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function browserSupportsWebPush(): boolean {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

/** `navigator.serviceWorker.ready` može vječno čekati ako SW nikad ne postane aktivan (npr. neuspješni register). */
const SW_READY_TIMEOUT_MS = 12_000;

function withTimeout<T>(ms: number, p: Promise<T>): Promise<T> {
  let id: ReturnType<typeof setTimeout>;
  return new Promise((resolve, reject) => {
    id = setTimeout(() => reject(new Error("sw_ready_timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

/**
 * Aktivna registracija za push (brzi put ako već postoji; inače čeka `ready` s timeoutom).
 */
export async function getServiceWorkerRegistrationForPush(): Promise<ServiceWorkerRegistration | null> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;
  try {
    return await withTimeout(SW_READY_TIMEOUT_MS, navigator.serviceWorker.ready);
  } catch {
    return (await navigator.serviceWorker.getRegistration()) ?? null;
  }
}

export type PushReadyState =
  | { kind: "no_vapid" }
  | { kind: "unsupported"; reason: string }
  | { kind: "ready"; permission: NotificationPermission; subscribed: boolean };

export async function getPushReadyState(vapidPublicKey: string | undefined): Promise<PushReadyState> {
  if (!vapidPublicKey) return { kind: "no_vapid" };
  if (!browserSupportsWebPush()) {
    return {
      kind: "unsupported",
      reason:
        "Na ovom pregledniku push nije podržan. Probajte Chrome na Androidu ili Safari nakon što dodate sajt na početni ekran (iPhone).",
    };
  }
  try {
    const reg = await getServiceWorkerRegistrationForPush();
    if (!reg) {
      return {
        kind: "unsupported",
        reason:
          "Service worker se nije učitao u roku (npr. blokiran ili neuspješni SW). Osvježite stranicu; na HTTPS provjerite da /sw.js radi.",
      };
    }
    const sub = await reg.pushManager.getSubscription();
    return {
      kind: "ready",
      permission: Notification.permission,
      subscribed: !!sub,
    };
  } catch {
    return {
      kind: "unsupported",
      reason: "Nije moguće provjeriti pretplatu. Osvježite stranicu i pokušajte ponovo.",
    };
  }
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; reason: "permission_denied" | "server_error" | "subscribe_failed"; message?: string };

function normalizeSubscribeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw.toLowerCase();

  // Česta greška na nekim Android uređajima / preglednicima bez dostupnog push servisa.
  if (msg.includes("push service error") || msg.includes("registration failed")) {
    return "Preglednik na ovom uređaju trenutno ne može registrovati push servis. Probajte Chrome (ažuriran), uključite Google Play Services i ponovo pokrenite preglednik.";
  }
  if (msg.includes("notsupportederror")) {
    return "Push obavještenja nijesu podržana u ovom pregledniku/na ovom uređaju.";
  }
  if (msg.includes("invalidstateerror")) {
    return "Push pretplata nije uspjela zbog stanja preglednika. Osvježite stranicu i pokušajte ponovo.";
  }
  if (msg.includes("aborterror")) {
    return "Registracija push obavještenja je prekinuta. Provjerite mrežu i pokušajte ponovo.";
  }
  if (msg.includes("networkerror")) {
    return "Mrežna greška pri registraciji push obavještenja. Provjerite internet i pokušajte ponovo.";
  }

  return raw && raw !== "[object Object]" ? raw : "Greška pri uključivanju obavještenja.";
}

function shouldRetrySubscribeError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw.toLowerCase();
  return (
    msg.includes("push service error") ||
    msg.includes("registration failed") ||
    msg.includes("invalidstateerror") ||
    msg.includes("aborterror") ||
    msg.includes("networkerror") ||
    msg.includes("sw_ready_timeout")
  );
}

async function ensureFreshServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    try {
      await reg.update();
    } catch {
      /* ignore */
    }
    if (reg.active) return reg;
    return await withTimeout(SW_READY_TIMEOUT_MS, navigator.serviceWorker.ready);
  } catch {
    return getServiceWorkerRegistrationForPush();
  }
}

async function saveSubscriptionOnServer(sub: PushSubscription): Promise<SubscribeResult> {
  const json = sub.toJSON();
  console.info("[push-client] POST /api/push/subscribe …", { endpointPrefix: (json.endpoint ?? "").slice(0, 48) });
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
    }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    console.warn("[push-client] subscribe save failed", { httpStatus: res.status, error: j.error });
    try {
      await sub.unsubscribe();
      console.info("[push-client] local subscription unsubscribed after failed server save");
    } catch (u) {
      console.warn("[push-client] unsubscribe after failed save failed", u);
    }
    return {
      ok: false,
      reason: "server_error",
      message: j.error ?? "Podešavanja nisu sačuvana. Pokušajte ponovo.",
    };
  }
  console.info("[push-client] subscribe save ok");
  return { ok: true };
}

async function subscribeWithRegistration(reg: ServiceWorkerRegistration, vapidPublicKey: string): Promise<SubscribeResult> {
  const subscribeOnce = async (r: ServiceWorkerRegistration): Promise<SubscribeResult> => {
    let sub = await r.pushManager.getSubscription();
    if (!sub) {
      console.info("[push-client] pushManager.subscribe() …");
      sub = await r.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
    }
    return saveSubscriptionOnServer(sub);
  };

  try {
    return await subscribeOnce(reg);
  } catch (e) {
    if (!shouldRetrySubscribeError(e)) {
      return {
        ok: false,
        reason: "subscribe_failed",
        message: normalizeSubscribeErrorMessage(e),
      };
    }
    console.warn("[push-client] subscribe failed, trying recovery re-register", {
      name: e instanceof Error ? e.name : typeof e,
      message: e instanceof Error ? e.message : String(e),
    });

    try {
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe().catch(() => {});
      }
    } catch {
      /* ignore */
    }

    const freshReg = await ensureFreshServiceWorkerRegistration();
    if (!freshReg) {
      return {
        ok: false,
        reason: "subscribe_failed",
        message: "Service worker nije spreman. Ažurirajte aplikaciju i pokušajte ponovo.",
      };
    }

    try {
      return await subscribeOnce(freshReg);
    } catch (e2) {
      return {
        ok: false,
        reason: "subscribe_failed",
        message: normalizeSubscribeErrorMessage(e2),
      };
    }
  }
}

/** Broj pretplata za trenutnog korisnika u bazi (0 ako nije sačuvano ili niste prijavljeni). */
export type ServerPushStatus = {
  count: number;
  serverCanSendPush: boolean;
};

export async function fetchServerPushStatus(): Promise<ServerPushStatus> {
  try {
    const res = await fetch("/api/push/status", { credentials: "include" });
    const j = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { count?: number; serverCanSendPush?: boolean };
    };
    if (j.success && typeof j.data?.count === "number") {
      return {
        count: j.data.count,
        serverCanSendPush: j.data.serverCanSendPush !== false,
      };
    }
  } catch {
    /* ignore */
  }
  return { count: 0, serverCanSendPush: true };
}

export type PushUiReadyState = {
  kind: "ready";
  permission: NotificationPermission;
  subscribed: boolean;
  /** Koliko pretplata ima ovaj nalog na serveru — UI „uključeno“ samo ako je >0 i lokalno subscribed */
  serverSubscriptionCount: number;
  /** Da li je backend sposoban da šalje push (VAPID public+private). */
  serverCanSendPush: boolean;
};

export type PushUiState =
  | { kind: "loading" }
  | { kind: "no_vapid" }
  | { kind: "unsupported"; reason: string }
  | PushUiReadyState;

/**
 * Lokalno stanje + broj pretplata na serveru (za iskreno „uključeno“ bez lažnog zelenog stanja).
 */
export async function getPushUiState(vapidPublicKey: string | undefined): Promise<PushUiState> {
  const base = await getPushReadyState(vapidPublicKey);
  if (base.kind !== "ready") return base;
  const server = await fetchServerPushStatus();
  if (!server.serverCanSendPush) {
    return { kind: "no_vapid" };
  }
  return { ...base, serverSubscriptionCount: server.count, serverCanSendPush: server.serverCanSendPush };
}

/**
 * Traži dozvolu (ako treba), pretplaćuje PushManager i šalje ključeve na /api/push/subscribe.
 * Ako server ne sačuva, lokalna pretplata se otkazuje da UI ne prikaže lažno „uključeno“.
 */
export async function requestPermissionAndSubscribe(vapidPublicKey: string): Promise<SubscribeResult> {
  if (!browserSupportsWebPush()) {
    return { ok: false, reason: "subscribe_failed", message: "Preglednik ne podržava obavještenja." };
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      return { ok: false, reason: "permission_denied" };
    }
    const reg = await getServiceWorkerRegistrationForPush();
    if (!reg) {
      return {
        ok: false,
        reason: "subscribe_failed",
        message: "Service worker nije spreman. Osvježite stranicu i pokušajte ponovo.",
      };
    }
    return subscribeWithRegistration(reg, vapidPublicKey);
  } catch (e) {
    console.warn("[push-client] subscribe failed", {
      name: e instanceof Error ? e.name : typeof e,
      message: e instanceof Error ? e.message : String(e),
    });
    return {
      ok: false,
      reason: "subscribe_failed",
      message: normalizeSubscribeErrorMessage(e),
    };
  }
}

/** Endpoint trenutne lokalne pretplate (ako postoji). */
export async function getCurrentPushSubscriptionEndpoint(): Promise<string | null> {
  if (!browserSupportsWebPush()) return null;
  try {
    const reg = await getServiceWorkerRegistrationForPush();
    if (!reg) return null;
    const sub = await reg.pushManager.getSubscription();
    return sub?.endpoint ?? null;
  } catch {
    return null;
  }
}

/**
 * "Self-heal" pretplate:
 * - ukloni postojeću lokalnu pretplatu (ako postoji),
 * - kreiraj novu,
 * - sačuvaj na serveru.
 */
export async function forceResubscribe(vapidPublicKey: string): Promise<SubscribeResult> {
  if (!browserSupportsWebPush()) {
    return { ok: false, reason: "subscribe_failed", message: "Preglednik ne podržava obavještenja." };
  }
  try {
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return { ok: false, reason: "permission_denied" };
    }
    const reg = await getServiceWorkerRegistrationForPush();
    if (!reg) {
      return {
        ok: false,
        reason: "subscribe_failed",
        message: "Service worker nije spreman. Osvježite stranicu i pokušajte ponovo.",
      };
    }
    const existing = await reg.pushManager.getSubscription();
    if (existing) {
      try {
        await existing.unsubscribe();
        console.info("[push-client] existing subscription removed for self-heal");
      } catch (e) {
        console.warn("[push-client] failed to remove existing subscription", e);
      }
    }
    return subscribeWithRegistration(reg, vapidPublicKey);
  } catch (e) {
    return {
      ok: false,
      reason: "subscribe_failed",
      message: normalizeSubscribeErrorMessage(e),
    };
  }
}
