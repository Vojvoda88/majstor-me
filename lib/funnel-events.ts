/**
 * Funnel event logging – monetizacioni funnel analytics.
 * Jednostavna instrumentacija bez vanjskog analytics sistema.
 */

import type { PrismaClient } from "@prisma/client";

export type FunnelEventType =
  | "request_created"
  | "lead_viewed_by_handyman"
  | "unlock_clicked"
  | "unlock_success"
  | "insufficient_credits_seen"
  | "credits_page_viewed"
  | "credit_package_selected"
  | "credit_purchase_started"
  | "credit_purchase_success"
  | "offer_sent_after_unlock";

export type FunnelMetadata = {
  requestId?: string;
  packageId?: string;
  creditsRequired?: number;
  creditsSpent?: number;
  handymanId?: string;
  [key: string]: string | number | boolean | undefined;
};

export async function trackFunnelEvent(
  prisma: Pick<PrismaClient, "funnelEvent">,
  event: FunnelEventType,
  metadata?: FunnelMetadata,
  userId?: string | null
): Promise<void> {
  try {
    await prisma.funnelEvent.create({
      data: {
        event,
        metadata: metadata ?? undefined,
        userId: userId ?? undefined,
      },
    });
  } catch (e) {
    // Fire-and-forget – ne blokira UX
    if (process.env.NODE_ENV === "development") {
      console.warn("[FunnelEvent] Failed to track:", event, e);
    }
  }
}
