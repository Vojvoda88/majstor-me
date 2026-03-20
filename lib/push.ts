/**
 * Web Push notifikacije za majstore.
 * Zahtijeva VAPID keys u .env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
 */
import webpush from "web-push";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (publicKey && privateKey) {
    webpush.setVapidDetails("mailto:support@brzimajstor.me", publicKey, privateKey);
    vapidConfigured = true;
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
  } catch {
    return false;
  }
}

/**
 * Pošalji push svim pretplatama određenog korisnika.
 */
export async function sendPushToUser(
  prisma: { pushSubscription: { findMany: (args: { where: { userId: string } }) => Promise<Array<{ endpoint: string; p256dh: string; auth: string }>> } },
  userId: string,
  payload: PushPayload
): Promise<number> {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  let sent = 0;
  for (const sub of subs) {
    const ok = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    );
    if (ok) sent++;
  }
  return sent;
}
