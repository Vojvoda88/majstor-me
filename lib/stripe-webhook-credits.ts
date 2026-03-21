import type Stripe from "stripe";
import { getPackageById } from "@/lib/credit-packages";
import type { PrismaClient } from "@prisma/client";

/**
 * Obrada checkout.session.completed — dodaje kredite majstoru (idempotentno).
 */
export async function applyCreditsFromCheckoutSession(
  prisma: PrismaClient,
  session: Stripe.Checkout.Session,
  stripeEventId: string
): Promise<{ applied: boolean; reason?: string }> {
  if (session.mode !== "payment") {
    return { applied: false, reason: "not_payment_mode" };
  }
  if (session.payment_status !== "paid") {
    return { applied: false, reason: "not_paid" };
  }

  const md = session.metadata ?? {};
  if (md.transactionType !== "credit_purchase") {
    return { applied: false, reason: "wrong_transaction_type" };
  }

  const handymanId = md.handymanId ?? md.userId;
  const packageId = md.packageId;
  const creditsRaw = md.credits;
  const amountEurRaw = md.amountEur;

  if (!handymanId || !packageId || creditsRaw == null || amountEurRaw == null) {
    console.error("[Stripe webhook] Missing metadata", { md });
    return { applied: false, reason: "missing_metadata" };
  }

  const credits = parseInt(creditsRaw, 10);
  const amountEur = parseFloat(amountEurRaw);
  if (!Number.isFinite(credits) || credits <= 0 || !Number.isFinite(amountEur)) {
    return { applied: false, reason: "invalid_metadata_numbers" };
  }

  const pkg = getPackageById(packageId);
  if (!pkg || pkg.credits !== credits || Math.abs(pkg.priceEur - amountEur) > 0.001) {
    console.error("[Stripe webhook] Package mismatch", { packageId, credits, amountEur });
    return { applied: false, reason: "package_mismatch" };
  }

  const expectedTotal = Math.round(pkg.priceEur * 100);
  const paidTotal = session.amount_total;
  if (paidTotal != null && paidTotal !== expectedTotal) {
    console.error("[Stripe webhook] Amount mismatch", { expectedTotal, paidTotal });
    return { applied: false, reason: "amount_mismatch" };
  }

  const sessionId = session.id;

  return prisma.$transaction(async (tx) => {
    const alreadyEvent = await tx.stripeProcessedEvent.findUnique({
      where: { stripeEventId },
    });
    if (alreadyEvent) {
      return { applied: false, reason: "duplicate_event" };
    }

    const existingPurchase = await tx.creditTransaction.findFirst({
      where: {
        handymanId,
        type: "PURCHASE",
        referenceId: sessionId,
      },
    });
    if (existingPurchase) {
      await tx.stripeProcessedEvent.create({
        data: { stripeEventId },
      });
      return { applied: false, reason: "duplicate_session" };
    }

    const profile = await tx.handymanProfile.findUnique({
      where: { userId: handymanId },
    });
    if (!profile) {
      throw new Error("Handyman profile not found");
    }

    const balanceBefore = profile.creditsBalance;
    const balanceAfter = balanceBefore + credits;

    await tx.handymanProfile.update({
      where: { userId: handymanId },
      data: { creditsBalance: balanceAfter },
    });

    await tx.creditTransaction.create({
      data: {
        handymanId,
        amount: credits,
        type: "PURCHASE",
        referenceId: sessionId,
        balanceBefore,
        balanceAfter,
        reason: `Online kupovina (${pkg.label})`,
      },
    });

    await tx.stripeProcessedEvent.create({
      data: { stripeEventId },
    });

    return { applied: true };
  });
}
