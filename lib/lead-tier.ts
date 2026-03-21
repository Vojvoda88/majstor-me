/**
 * Cijena otključavanja kontakta u kreditima – varira po hitnosti i kvalitetu.
 * Baza: standardni 200, hitno (7 dana) 300, hitno danas 400 (+ dodatci, max 650).
 */

export type LeadTier = "STANDARD" | "URGENT" | "PREMIUM";

export type LeadInput = {
  urgency: "HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO";
  photos?: string[];
  description?: string;
  /** Email verifikovan → +50 kredita */
  emailVerified?: boolean;
  /** Telefon verifikovan → +100 kredita. Oba = max +150 */
  phoneVerified?: boolean;
};

/** NIJE_HITNO — „normalno / fleksibilno“ */
const BASE_STANDARD = 200;
/** U_NAREDNA_2_DANA u bazi = UI „Hitno (u narednih 7 dana)“ */
const BASE_URGENT = 300;
/** HITNO_DANAS */
const BASE_PREMIUM = 400;

const PREMIUM_DESC_LENGTH = 150;
const PREMIUM_PHOTO_BONUS = 50;
const LONG_DESC_BONUS = 50;
const EMAIL_VERIFIED_BONUS = 50;
const PHONE_VERIFIED_BONUS = 100;
const MAX_VERIFIED_BONUS = 150;
/** Ukupno sa svim dodacima ne prelazi 650 (najveći paket u ponudi). */
const MAX_TOTAL_CREDITS = 650;

export function getCreditsForLead(input: LeadInput): { credits: number; tier: LeadTier } {
  let base: number;
  if (input.urgency === "HITNO_DANAS") {
    base = BASE_PREMIUM;
  } else if (input.urgency === "U_NAREDNA_2_DANA") {
    base = BASE_URGENT;
  } else {
    base = BASE_STANDARD;
  }

  let bonus = 0;
  if (input.photos && input.photos.length > 0) {
    bonus += PREMIUM_PHOTO_BONUS;
  }
  if (input.description && input.description.length >= PREMIUM_DESC_LENGTH) {
    bonus += LONG_DESC_BONUS;
  }
  let verifiedBonus = 0;
  if (input.emailVerified) verifiedBonus += EMAIL_VERIFIED_BONUS;
  if (input.phoneVerified) verifiedBonus += PHONE_VERIFIED_BONUS;
  bonus += Math.min(verifiedBonus, MAX_VERIFIED_BONUS);

  const credits = Math.min(base + bonus, MAX_TOTAL_CREDITS);
  const tier: LeadTier =
    input.urgency === "HITNO_DANAS" ? "PREMIUM" : input.urgency === "U_NAREDNA_2_DANA" ? "URGENT" : "STANDARD";

  return { credits, tier };
}

export type CreditBreakdownItem = {
  label: string;
  amount: number;
};

export type CreditBreakdown = {
  base: number;
  baseLabel: string;
  items: CreditBreakdownItem[];
  total: number;
};

export function getCreditsBreakdown(input: LeadInput): CreditBreakdown {
  let base: number;
  let baseLabel: string;
  if (input.urgency === "HITNO_DANAS") {
    base = BASE_PREMIUM;
    baseLabel = "Hitno danas";
  } else if (input.urgency === "U_NAREDNA_2_DANA") {
    base = BASE_URGENT;
    baseLabel = "Hitno (u narednih 7 dana)";
  } else {
    base = BASE_STANDARD;
    baseLabel = "Nije hitno / fleksibilno";
  }

  const items: CreditBreakdownItem[] = [];

  if (input.photos && input.photos.length > 0) {
    items.push({ label: "Slike", amount: PREMIUM_PHOTO_BONUS });
  }
  if (input.description && input.description.length >= PREMIUM_DESC_LENGTH) {
    items.push({ label: "Dug opis", amount: LONG_DESC_BONUS });
  }
  let verifiedBonus = 0;
  if (input.emailVerified) verifiedBonus += EMAIL_VERIFIED_BONUS;
  if (input.phoneVerified) verifiedBonus += PHONE_VERIFIED_BONUS;
  const verifiedTotal = Math.min(verifiedBonus, MAX_VERIFIED_BONUS);
  if (verifiedTotal > 0) {
    if (input.emailVerified && input.phoneVerified) {
      items.push({ label: "Email + telefon verifikovani", amount: verifiedTotal });
    } else if (input.emailVerified) {
      items.push({ label: "Email verifikovan", amount: EMAIL_VERIFIED_BONUS });
    } else {
      items.push({ label: "Telefon verifikovan", amount: PHONE_VERIFIED_BONUS });
    }
  }

  const bonusSum = items.reduce((s, i) => s + i.amount, 0);
  const total = Math.min(base + bonusSum, MAX_TOTAL_CREDITS);

  return { base, baseLabel, items, total };
}
