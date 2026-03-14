/**
 * Payment service abstraction – spreman za Stripe ili drugi provider.
 *
 * Nedostaje:
 * - Stripe SDK integracija
 * - Webhook handler za uspješne uplate
 * - Kreiranje checkout session
 * - Mapiranje payment -> dodavanje kredita
 *
 * Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 */

export type CreateCheckoutParams = {
  handymanId: string;
  packageId: string; // e.g. "credits_5", "credits_10"
  successUrl: string;
  cancelUrl: string;
};

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string; sessionId: string }
  | { ok: false; error: string };

/**
 * Kreira Stripe Checkout session za kupovinu kredita.
 * Implementirati kada Stripe bude povezan.
 */
export async function createCreditsCheckout(
  _params: CreateCheckoutParams
): Promise<CreateCheckoutResult> {
  return {
    ok: false,
    error: "Payment provider nije konfigurisan. Kontaktirajte administratora.",
  };
}

export function isPaymentConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
