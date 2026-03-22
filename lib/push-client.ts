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
    const reg = await navigator.serviceWorker.ready;
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

/**
 * Traži dozvolu (ako treba), pretplaćuje PushManager i šalje ključeve na /api/push/subscribe.
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
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
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
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        ok: false,
        reason: "server_error",
        message: j.error ?? "Podešavanja nisu sačuvana. Pokušajte ponovo.",
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason: "subscribe_failed",
      message: e instanceof Error ? e.message : "Greška pri uključivanju.",
    };
  }
}
