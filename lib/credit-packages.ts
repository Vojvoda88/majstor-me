/**
 * Paketi kredita – interna valuta platforme.
 * Primjer: 10€ = 100 kredita. Jedan lead troši 20–60 kredita zavisno od kvaliteta.
 */

export type CreditPackage = {
  id: string;
  credits: number;
  priceEur: number;
  label: string;
  popular?: boolean;
  perCredit?: string; // npr. "1€ / 10 kredita"
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "credits_100", credits: 100, priceEur: 9.99, label: "100 kredita", perCredit: "~0.10€ / kredit" },
  { id: "credits_275", credits: 275, priceEur: 24.99, label: "275 kredita", popular: true, perCredit: "~0.09€ / kredit" },
  { id: "credits_600", credits: 600, priceEur: 49.99, label: "600 kredita", perCredit: "~0.08€ / kredit" },
  { id: "credits_1300", credits: 1300, priceEur: 99.99, label: "1300 kredita", perCredit: "~0.08€ / kredit" },
];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
