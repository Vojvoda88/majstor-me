/**
 * Stripe Checkout za kupovinu kredita (majstori).
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (webhook), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (opciono, za budući Elements)
 */

import { getPackageById } from "@/lib/credit-packages";
import { getStripe } from "@/lib/stripe-server";

export type CreateCheckoutParams = {
  handymanId: string;
  packageId: string;
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string; sessionId: string }
  | { ok: false; error: string };

export async function createCreditsCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      error: "Online plaćanje trenutno nije dostupno. Koristite aktivaciju u kešu ili kontaktirajte podršku.",
    };
  }

  const pkg = getPackageById(params.packageId);
  if (!pkg) {
    return { ok: false, error: "Nepoznat paket kredita." };
  }

  const unitAmount = Math.round(pkg.priceEur * 100);
  if (unitAmount < 50) {
    return { ok: false, error: "Neispravan iznos paketa." };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: `BrziMajstor.ME — ${pkg.credits} kredita`,
              description: "Krediti za otključavanje kontakata klijenata",
            },
          },
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.handymanId,
        handymanId: params.handymanId,
        packageId: pkg.id,
        credits: String(pkg.credits),
        amountEur: String(pkg.priceEur),
        transactionType: "credit_purchase",
      },
    });

    if (!session.url) {
      return { ok: false, error: "Nije moguće otvoriti plaćanje. Pokušajte ponovo." };
    }

    return {
      ok: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (e) {
    console.error("[Stripe] checkout.session.create", e);
    return {
      ok: false,
      error: "Greška pri pripremi plaćanja. Pokušajte ponovo ili koristite aktivaciju u kešu.",
    };
  }
}

/** True kada je moguće pokrenuti Checkout (server ima tajni ključ). */
export function isPaymentConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim();
}

/** Webhook zahtijeva poseban secret u Stripe dashboardu. */
export function isStripeWebhookConfigured(): boolean {
  return !!process.env.STRIPE_WEBHOOK_SECRET?.trim();
}
