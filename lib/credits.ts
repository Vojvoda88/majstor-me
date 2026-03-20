/**
 * Krediti za majstore – interna valuta. Otključavanje leada troši 20–60 kredita.
 * Slanje ponude je besplatno NAKON otključanja leada.
 *
 * CREDITS_REQUIRED=true u .env aktivira provjeru. Bez toga, lead unlock je besplatan.
 */

import type { Prisma } from "@prisma/client";
import { getCreditsForLead } from "@/lib/lead-tier";

export function isCreditsRequired(): boolean {
  return process.env.CREDITS_REQUIRED === "true";
}

export type SpendCreditsResult =
  | { ok: true; balanceAfter: number }
  | { ok: false; error: string; balance: number };

export type LeadInput = {
  urgency: "HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO";
  photos?: string[];
  description?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

/** Vrati broj kredita potreban za otključaj leada. */
export function getCreditsRequiredForLead(input: LeadInput): number {
  return getCreditsForLead(input).credits;
}

/**
 * Provjeri da li majstor ima dovoljno kredita za otključaj leada.
 */
export async function hasEnoughCreditsForUnlock(
  prisma: { handymanProfile: { findUnique: any } },
  handymanId: string,
  creditsRequired: number
): Promise<{ ok: boolean; balance: number }> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });
  const balance = (profile as { creditsBalance?: number } | null)?.creditsBalance ?? 0;
  return { ok: balance >= creditsRequired, balance };
}

/**
 * Potroši kredite za otključavanje leada (kontakt korisnika). Vraća balanceAfter ili error.
 */
export async function spendCreditsForContactUnlock(
  prisma: { handymanProfile: { findUnique: any; update: any }; creditTransaction: { create: any }; $transaction: any },
  handymanId: string,
  requestId: string,
  creditsRequired: number
): Promise<SpendCreditsResult> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });

  if (!profile) {
    return { ok: false, error: "Profil nije pronađen", balance: 0 };
  }

  const balance = (profile as { creditsBalance?: number }).creditsBalance ?? 0;

  if (balance < creditsRequired) {
    return {
      ok: false,
      error: `Nemate dovoljno kredita. Potrebno: ${creditsRequired}, imate: ${balance}. Kupite kredite da biste mogli otključati lead.`,
      balance,
    };
  }

  const balanceAfter = balance - creditsRequired;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.handymanProfile.update({
      where: { userId: handymanId },
      data: { creditsBalance: balanceAfter },
    });
    await tx.creditTransaction.create({
      data: {
        handymanId,
        amount: -creditsRequired,
        type: "CONTACT_UNLOCK",
        referenceId: requestId,
        balanceAfter,
      },
    });
  });

  return { ok: true, balanceAfter };
}
