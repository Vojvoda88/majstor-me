/**
 * Paketi kredita – interna valuta platforme.
 * Primjer: 10€ = 100 kredita. Jedan lead troši oko 20–65 kredita zavisno od hitnosti i kvaliteta.
 */

export type CreditPackage = {
  id: string;
  credits: number;
  priceEur: number;
  label: string;
  popular?: boolean;
  perCredit?: string; // npr. "1€ / 10 kredita"
};

/** Tri fiksna paketa — usklađeno sa biznisom i Stripe Checkout mapiranjem. */
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "credits_100", credits: 100, priceEur: 9.99, label: "100 kredita", perCredit: "~0,10 € / kredit" },
  {
    id: "credits_300",
    credits: 300,
    priceEur: 24.99,
    label: "300 kredita",
    popular: true,
    perCredit: "~0,08 € / kredit",
  },
  { id: "credits_650", credits: 650, priceEur: 49.99, label: "650 kredita", perCredit: "~0,08 € / kredit" },
];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/** Standardni lead ≈ 20 kredita (bazni nivo). Koristi se za procjenu "oko X kontakata". */
export const STANDARD_LEAD_CREDITS = 20;

export function getLeadsEstimate(credits: number): number {
  return Math.floor(credits / STANDARD_LEAD_CREDITS);
}
