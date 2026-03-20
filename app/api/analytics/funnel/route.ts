import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { trackFunnelEvent } from "@/lib/funnel-events";
import type { FunnelEventType } from "@/lib/funnel-events";

export const dynamic = "force-dynamic";

const VALID_EVENTS: FunnelEventType[] = [
  "request_created",
  "lead_viewed_by_handyman",
  "unlock_clicked",
  "unlock_success",
  "insufficient_credits_seen",
  "credits_page_viewed",
  "credit_package_selected",
  "credit_purchase_started",
  "credit_purchase_success",
  "offer_sent_after_unlock",
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json().catch(() => ({}));
    const event = body?.event as string | undefined;
    const metadata = body?.metadata as Record<string, unknown> | undefined;

    if (!event || !VALID_EVENTS.includes(event as FunnelEventType)) {
      return NextResponse.json({ success: false, error: "Invalid event" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    await trackFunnelEvent(
      prisma,
      event as FunnelEventType,
      metadata ?? undefined,
      session?.user?.id ?? undefined
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
