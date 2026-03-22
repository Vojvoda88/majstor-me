/**
 * Web Push notifikacije za majstore.
 * Zahtijeva VAPID keys u .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
import webpush from "web-push";

let vapidConfigured = false;
let vapidMissingLogged = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails("mailto:support@brzimajstor.me", publicKey, privateKey);
    vapidConfigured = true;
  } else if (!vapidMissingLogged) {
    vapidMissingLogged = true;
    console.warn("[push] Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY — server cannot send push");
  }
}

export type PushPayload = {
  title: string;
  body?: string;
  link?: string;
  tag?: string;
};

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
): Promise<boolean> {
  ensureVapid();
  if (!vapidConfigured) return false;

  try {
    const base = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://brzimajstor.me";
    const link = payload.link?.startsWith("/") ? `${base}${payload.link}` : payload.link ?? base;

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
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = typeof e === "object" && e !== null && "statusCode" in e ? String((e as { statusCode?: number }).statusCode) : "";
    console.warn("[push] sendNotification failed", {
      statusCode: status || undefined,
      message: msg.slice(0, 300),
      endpointPrefix: subscription.endpoint.slice(0, 48),
    });
    return false;
  }
}

export type SendPushTrace = { requestId?: string };

/**
 * Pošalji push svim pretplatama određenog korisnika.
 */
export async function sendPushToUser(
  prisma: { pushSubscription: { findMany: (args: { where: { userId: string } }) => Promise<Array<{ endpoint: string; p256dh: string; auth: string }>> } },
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
  });
  let sent = 0;
  for (const sub of subs) {
    const ok = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (ok) sent++;
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
    console.warn("[push] sendPushToUser: 0/OK deliveries for user", {
      userId,
      requestId: trace?.requestId,
      subscriptionCount: subs.length,
    });
  }
  return sent;
}
