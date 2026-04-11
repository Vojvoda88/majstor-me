import { createNotificationsBulk } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import type { PrismaClient } from "@prisma/client";

export type CreditPurchaseNotifyParams = {
  stripeEventId: string;
  handymanName: string;
  credits: number;
  packageLabel: string;
  sessionId: string;
};

/**
 * Nakon uspješnog webhook knjiženja — obavještava sve admine (in-app + web push).
 * Ne baca grešku (webhook mora ostati 200).
 */
export async function notifyAdminsCreditPurchase(
  prisma: PrismaClient,
  params: CreditPurchaseNotifyParams
): Promise<void> {
  const { stripeEventId, handymanName, credits, packageLabel, sessionId } = params;
  if (!Number.isFinite(credits) || credits <= 0) return;

  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [{ role: "ADMIN" }, { adminProfile: { isNot: null } }],
      },
      select: { id: true },
    });
    const adminIds = Array.from(new Set(admins.map((a) => a.id)));
    if (adminIds.length === 0) return;

    const title = "Nova kupovina kredita";
    const body = `${handymanName}: +${credits} kredita${packageLabel ? ` (${packageLabel})` : ""}`;
    const link = "/admin/payments";

    await createNotificationsBulk(
      adminIds.map((userId) => ({
        userId,
        type: "ADMIN_CREDIT_PURCHASE",
        title,
        body,
        link,
        idempotencyKey: `stripe-credit-${stripeEventId}`,
      }))
    );

    await Promise.allSettled(
      adminIds.map((userId) =>
        sendPushToUser(
          prisma,
          userId,
          {
            title,
            body,
            link,
            tag: `credit-purchase-${sessionId}`,
          },
          { requestId: stripeEventId }
        )
      )
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn("[notifyAdminsCreditPurchase] failed", msg.slice(0, 200));
  }
}
