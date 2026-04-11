import { prisma } from "@/lib/db";

export type NotificationType =
  | "NEW_OFFER"
  | "OFFER_ACCEPTED"
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "VERIFIED"
  | "NEW_JOB"
  | "ADMIN_PENDING_REQUEST"
  | "ADMIN_PENDING_HANDYMAN"
  | "ADMIN_CREDIT_PURCHASE";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  opts?: { body?: string; link?: string; idempotencyKey?: string }
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        idempotencyKey: opts?.idempotencyKey,
        title,
        body: opts?.body,
        link: opts?.link,
      },
    });
  } catch {
    // Non-critical, silently fail
  }
}

/** Bulk insert za distribuciju – jedna DB operacija umjesto N. */
export async function createNotificationsBulk(
  items: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string | null;
    link?: string | null;
    idempotencyKey?: string | null;
  }[]
) {
  if (items.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: items.map(({ userId, type, title, body, link, idempotencyKey }) => ({
        userId,
        type,
        idempotencyKey: idempotencyKey ?? null,
        title,
        body: body ?? null,
        link: link ?? null,
      })),
      skipDuplicates: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[notifications] createMany failed; fallback to per-row", {
      count: items.length,
      message: msg.slice(0, 200),
    });
    // Fallback: pojedinačno (non-blocking)
    await Promise.allSettled(
      items.map((item) =>
        createNotification(item.userId, item.type, item.title, {
          body: item.body ?? undefined,
          link: item.link ?? undefined,
          idempotencyKey: item.idempotencyKey ?? undefined,
        })
      )
    );
  }
}
