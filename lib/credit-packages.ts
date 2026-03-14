/**
 * Paketi kredita – spremno za Stripe integraciju.
 * ID se koristi kao Stripe price_id ili product reference.
 */

export type CreditPackage = {
  id: string;
  credits: number;
  priceEur: number;
  label: string;
  popular?: boolean;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "credits_5", credits: 5, priceEur: 4.99, label: "5 kredita" },
  { id: "credits_10", credits: 10, priceEur: 8.99, label: "10 kredita", popular: true },
  { id: "credits_25", credits: 25, priceEur: 19.99, label: "25 kredita" },
  { id: "credits_50", credits: 50, priceEur: 34.99, label: "50 kredita" },
];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
