/**
 * Cijena leada u kreditima – varira po hitnosti i kvalitetu.
 * Standard: 20–25, Urgent: 30–40, Premium: 40–60.
 */

export type LeadTier = "STANDARD" | "URGENT" | "PREMIUM";

export type LeadInput = {
  urgency: "HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO";
  photos?: string[];
  description?: string;
  /** Email verifikovan → +5 kredita */
  emailVerified?: boolean;
  /** Telefon verifikovan → +10 kredita. Oba = max +15 */
  phoneVerified?: boolean;
};

const BASE_STANDARD = 25;
const BASE_URGENT = 35;
const BASE_PREMIUM = 45;

const PREMIUM_DESC_LENGTH = 150;
const PREMIUM_PHOTO_BONUS = 5;
const EMAIL_VERIFIED_BONUS = 5;
const PHONE_VERIFIED_BONUS = 10;
const MAX_VERIFIED_BONUS = 15;

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
    bonus += 5;
  }
  let verifiedBonus = 0;
  if (input.emailVerified) verifiedBonus += EMAIL_VERIFIED_BONUS;
  if (input.phoneVerified) verifiedBonus += PHONE_VERIFIED_BONUS;
  bonus += Math.min(verifiedBonus, MAX_VERIFIED_BONUS);

  const credits = Math.min(base + bonus, 70);
  const tier: LeadTier =
    credits >= 40 ? "PREMIUM" : credits >= 30 ? "URGENT" : "STANDARD";

  return { credits, tier };
}
