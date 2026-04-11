/**
 * Direktan link na Checkout sesiju u Stripe Dashboardu (test vs live po STRIPE_SECRET_KEY).
 */
export function stripeCheckoutSessionDashboardUrl(sessionId: string): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const isLive = key.startsWith("sk_live_");
  const base = isLive ? "https://dashboard.stripe.com" : "https://dashboard.stripe.com/test";
  return `${base}/checkout/sessions/${encodeURIComponent(sessionId)}`;
}

export function isStripeCheckoutSessionId(ref: string | null | undefined): boolean {
  if (!ref?.trim()) return false;
  return ref.trim().startsWith("cs_");
}
