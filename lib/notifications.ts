import { prisma } from "@/lib/db";

export type NotificationType =
  | "NEW_OFFER"
  | "OFFER_ACCEPTED"
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "VERIFIED"
  | "NEW_JOB";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  opts?: { body?: string; link?: string }
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body: opts?.body,
        link: opts?.link,
      },
    });
  } catch {
    // Non-critical, silently fail
  }
}
