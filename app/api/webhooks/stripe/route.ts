import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { applyCreditsFromCheckoutSession, sendCreditPurchaseSignals } from "@/lib/stripe-webhook-credits";
import { notifyAdminsCreditPurchase } from "@/lib/admin-signals";
import { getStripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe webhook — checkout.session.completed → krediti.
 * U Stripe Dashboard: endpoint URL + signing secret u STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.warn("[Stripe webhook] STRIPE_WEBHOOK_SECRET nije postavljen");
    return NextResponse.json({ error: "Webhook nije konfigurisan" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe nije konfigurisan" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Nedostaje potpis" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    console.error("[Stripe webhook] Verifikacija potpisa nije uspjela", e);
    return NextResponse.json({ error: "Neispravan potpis" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      const { prisma } = await import("@/lib/db");
      const result = await applyCreditsFromCheckoutSession(prisma, session, event.id);
      if (!result.applied && result.reason && result.reason !== "duplicate_event" && result.reason !== "duplicate_session") {
        console.warn("[Stripe webhook] Nije knjiženo", result.reason, { sessionId: session.id });
      }
      if (result.applied) {
        const md = session.metadata ?? {};
        const handymanId = md.handymanId ?? md.userId;
        const credits = parseInt(md.credits ?? "", 10);
        const packageLabel = md.packageId ? md.packageId.replace(/^credits_/, "") + " kredita" : "paket kredita";
        if (handymanId && Number.isFinite(credits) && credits > 0) {
          const handyman = await prisma.user.findUnique({
            where: { id: handymanId },
            select: { name: true },
          });
          await sendCreditPurchaseSignals(prisma, {
            handymanId,
            credits,
            packageLabel,
          });
          await notifyAdminsCreditPurchase({
            handymanUserId: handymanId,
            handymanName: handyman?.name,
            credits,
            packageLabel,
            stripeSessionId: session.id,
          });
        }
      }
    } catch (e) {
      console.error("[Stripe webhook] Obrada sesije", e);
      return NextResponse.json({ error: "Obrada nije uspjela" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
