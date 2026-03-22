/**
 * Interne notifikacije + web push za sve ADMIN korisnike (moderacija).
 */
import { sendPushToUser } from "@/lib/push";

export type AdminModerationNotificationType =
  | "ADMIN_PENDING_HANDYMAN_PROFILE"
  | "ADMIN_PENDING_REQUEST";

export async function notifyAdminsModeration(
  payload: {
    type: AdminModerationNotificationType;
    title: string;
    body?: string;
    /** Relativna putanja, npr. /admin/handymen/xyz */
    linkPath: string;
  }
): Promise<void> {
  const { prisma } = await import("@/lib/db");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: payload.type,
      title: payload.title,
      body: payload.body ?? null,
      link: payload.linkPath,
    })),
  });

  for (const a of admins) {
    void sendPushToUser(prisma, a.id, {
      title: payload.title,
      body: payload.body,
      link: payload.linkPath,
      tag: payload.type,
    });
  }
}
