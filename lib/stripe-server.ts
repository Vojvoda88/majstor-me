import Stripe from "stripe";

let stripeInstance: Stripe | null | undefined;

/**
 * Stripe klijent (server-only). null ako STRIPE_SECRET_KEY nije postavljen.
 */
export function getStripe(): Stripe | null {
  if (stripeInstance !== undefined) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    stripeInstance = null;
    return null;
  }
  stripeInstance = new Stripe(key, {
    typescript: true,
  });
  return stripeInstance;
}
