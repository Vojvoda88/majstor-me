/**
 * Web Push notifikacije za majstore.
 * Zahtijeva VAPID keys u .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
import webpush from "web-push";
import type { PrismaClient } from "@prisma/client";

let vapidConfigured = false;
let vapidMissingLogged = false;

export type PushServerConfig = {
  hasPublicKey: boolean;
  hasPrivateKey: boolean;
  hasClientPublicKey: boolean;
  publicKeysMatch: boolean;
  canSend: boolean;
};

export function getPushServerConfig(): PushServerConfig {
  const serverPublicKey = process.env.VAPID_PUBLIC_KEY?.trim() ?? "";
  const serverPrivateKey = process.env.VAPID_PRIVATE_KEY?.trim() ?? "";
  const clientPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "";
  const hasPublicKey = serverPublicKey.length > 0;
  const hasPrivateKey = serverPrivateKey.length > 0;
  const hasClientPublicKey = clientPublicKey.length > 0;
  const publicKeysMatch = hasPublicKey && hasClientPublicKey && serverPublicKey === clientPublicKey;
  return {
    hasPublicKey,
    hasPrivateKey,
    hasClientPublicKey,
    publicKeysMatch,
    canSend: hasPublicKey && hasPrivateKey && hasClientPublicKey && publicKeysMatch,
  };
}

function ensureVapid() {
  if (vapidConfigured) return;
  const cfg = getPushServerConfig();
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  // Isti uslov kao /api/push/subscribe: inače pretplate ne bi trebale postojati, ali bez poklapanja javnog ključa FCM vraća grešku.
  if (cfg.canSend && publicKey && privateKey) {
    webpush.setVapidDetails("mailto:support@brzimajstor.me", publicKey, privateKey);
    vapidConfigured = true;
  } else if (!vapidMissingLogged) {
    vapidMissingLogged = true;
    console.warn("[push] VAPID nije spreman za slanje (potrebni su oba tajna ključa i NEXT_PUBLIC_VAPID_PUBLIC_KEY koji se poklapa sa VAPID_PUBLIC_KEY)", {
      hasPublicKey: cfg.hasPublicKey,
      hasPrivateKey: cfg.hasPrivateKey,
      hasClientPublicKey: cfg.hasClientPublicKey,
      publicKeysMatch: cfg.publicKeysMatch,
    });
  }
}

export type PushPayload = {
  title: string;
  body?: string;
  link?: string;
  tag?: string;
};

function toAppRelativePath(link: string | undefined): string {
  if (!link?.trim()) return "/";
  const raw = link.trim();
  if (raw.startsWith("/")) return raw;
  try {
    const parsed = new URL(raw);
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return raw.startsWith("/") ? raw : `/${raw}`;
  }
}

function readWebPushStatusCode(e: unknown): number | undefined {
  if (typeof e === "object" && e !== null && "statusCode" in e) {
    const n = Number((e as { statusCode?: number }).statusCode);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export type PushSendResult = { ok: true } | { ok: false; statusCode?: number };

/**
 * Jedna isporuka; vraća status HTTP od push servisa (410/404 → čisti DB u sendPushToUser).
 */
export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<PushSendResult> {
  ensureVapid();
  if (!vapidConfigured) {
    console.warn("[push] send skipped: VAPID not configured", { endpointPrefix: subscription.endpoint.slice(0, 48) });
    return { ok: false };
  }

  try {
    const link = toAppRelativePath(payload.link);

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body ?? "",
        link,
        tag: payload.tag ?? "majstor-me",
      }),
      { TTL: 86400 }
    );
    return { ok: true };
  } catch (e) {
    const statusCode = readWebPushStatusCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[push] sendNotification failed", {
      statusCode: statusCode ?? undefined,
      message: msg.slice(0, 300),
      endpointPrefix: subscription.endpoint.slice(0, 48),
    });
    return { ok: false, statusCode };
  }
}

export type SendPushTrace = { requestId?: string };

/** HTTP statusi kod kojih push servis kaže da pretplata više ne važi — brišemo red u DB. */
const STALE_PUSH_STATUS_CODES = new Set([404, 410]);

/**
 * Pošalji push svim pretplatama određenog korisnika.
 * Jedna nevaljana pretplata se briše; ostale se i dalje šalju.
 */
export async function sendPushToUser(
  prisma: Pick<PrismaClient, "pushSubscription">,
  userId: string,
  payload: PushPayload,
  trace?: SendPushTrace
): Promise<number> {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  console.info("[push] sendPushToUser invoke", {
    userId,
    requestId: trace?.requestId,
    subscriptionCount: subs.length,
    title: payload.title,
  });
  let sent = 0;
  for (const sub of subs) {
    const result = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (result.ok) {
      sent++;
      console.info("[push] delivery ok", {
        userId,
        requestId: trace?.requestId,
        endpointPrefix: sub.endpoint.slice(0, 48),
      });
      continue;
    }
    const code = result.statusCode;
    if (code !== undefined && STALE_PUSH_STATUS_CODES.has(code)) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      console.info("[push] removed stale subscription after failed delivery", {
        userId,
        statusCode: code,
        endpointPrefix: sub.endpoint.slice(0, 48),
      });
    } else {
      console.warn("[push] delivery failed (subscription kept)", {
        userId,
        statusCode: code,
        endpointPrefix: sub.endpoint.slice(0, 48),
      });
    }
  }
  if (subs.length > 0) {
    console.info("[push] sendPushToUser result", {
      userId,
      requestId: trace?.requestId,
      okDeliveries: sent,
      attemptedSubscriptions: subs.length,
    });
  }
  if (subs.length > 0 && sent === 0) {
    console.warn("[push] sendPushToUser: 0 successful deliveries", {
      userId,
      requestId: trace?.requestId,
      subscriptionCount: subs.length,
    });
  }
  return sent;
}
