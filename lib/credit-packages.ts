/**
 * Paketi kredita – interna valuta platforme.
 * Model: 1 kredit ≈ 1 cent (u prodajnoj priči). Otključavanje kontakta: 200–650 kredita (hitnost + dodatci).
 */

export type CreditPackage = {
  id: string;
  credits: number;
  priceEur: number;
  label: string;
  popular?: boolean;
  perCredit?: string;
};

/** Tri fiksna paketa — usklađeno sa Stripe Checkout mapiranjem. */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "credits_1000",
    credits: 1000,
    priceEur: 9.99,
    label: "1000 kredita",
    perCredit: "~0,01 € / kredit",
  },
  {
    id: "credits_3000",
    credits: 3000,
    priceEur: 24.99,
    label: "3000 kredita",
    popular: true,
    perCredit: "~0,008 € / kredit",
  },
  {
    id: "credits_6500",
    credits: 6500,
    priceEur: 49.99,
    label: "6500 kredita",
    perCredit: "~0,008 € / kredit",
  },
];

/** Start bonus pri registraciji majstora (jednokratno, idempotentno u kodu). */
export const HANDYMAN_START_BONUS_CREDITS = 1000;

/** Stari ID-jevi paketa (Stripe metadata / keš zahtjevi) → novi paketi. */
const LEGACY_PACKAGE_ID_MAP: Record<string, string> = {
  credits_100: "credits_1000",
  credits_300: "credits_3000",
  credits_650: "credits_6500",
};

export function getPackageById(id: string): CreditPackage | undefined {
  const normalized = LEGACY_PACKAGE_ID_MAP[id] ?? id;
  return CREDIT_PACKAGES.find((p) => p.id === normalized);
}

/**
 * Standardni otključaj (nije hitno, bez dodataka) = 200 kredita.
 * Koristi se za procjenu „oko koliko kontakata“ u paketu.
 */
export const STANDARD_LEAD_CREDITS = 200;

export function getLeadsEstimate(credits: number): number {
  return Math.floor(credits / STANDARD_LEAD_CREDITS);
}
