/**
 * Krediti za majstore – interna valuta. Otključavanje leada troši oko 20–65 kredita (hitnost + dodatci).
 * Slanje ponude je besplatno NAKON otključanja leada.
 *
 * CREDITS_REQUIRED=true u .env aktivira provjeru. Bez toga, lead unlock je besplatan.
 */

import type { Prisma } from "@prisma/client";
import { getCreditsForLead } from "@/lib/lead-tier";

export function isCreditsRequired(): boolean {
  return process.env.CREDITS_REQUIRED === "true";
}

/** Prag ispod kojeg prikazujemo upozorenje "malo kredita" */
export const LOW_CREDITS_THRESHOLD = 30;

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
      error: `Nemate dovoljno kredita. Potrebno: ${creditsRequired}, imate: ${balance}. Kupite kredite da biste mogli uzeti kontakt.`,
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

export type RefundSpamResult = {
  refundCount: number;
  totalCreditsRefunded: number;
  alreadyRefunded: boolean;
};

/**
 * Refundira kredite svim majstorima koji su otključali lead označen kao SPAM.
 * Spriječava dupli refund – provjerava da li već postoje REFUND transakcije za taj request.
 */
export async function refundCreditsForSpamRequest(
  prisma: {
    creditTransaction: { findMany: any; create: any };
    handymanProfile: { findUnique: any; update: any };
    $transaction: any;
  },
  requestId: string,
  adminId: string
): Promise<RefundSpamResult> {
  const existingRefunds = await prisma.creditTransaction.findMany({
    where: { type: "REFUND", referenceId: requestId },
  });
  if (existingRefunds.length > 0) {
    return { refundCount: 0, totalCreditsRefunded: 0, alreadyRefunded: true };
  }

  const unlockTxns = await prisma.creditTransaction.findMany({
    where: { type: "CONTACT_UNLOCK", referenceId: requestId },
  });

  if (unlockTxns.length === 0) {
    return { refundCount: 0, totalCreditsRefunded: 0, alreadyRefunded: false };
  }

  let totalRefunded = 0;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    for (const txn of unlockTxns) {
      const refundAmount = -txn.amount;
      if (refundAmount <= 0) continue;

      const profile = await tx.handymanProfile.findUnique({
        where: { userId: txn.handymanId },
        select: { creditsBalance: true },
      });
      if (!profile) continue;

      const balanceBefore = (profile as { creditsBalance: number }).creditsBalance;
      const balanceAfter = balanceBefore + refundAmount;

      await tx.handymanProfile.update({
        where: { userId: txn.handymanId },
        data: { creditsBalance: balanceAfter },
      });

      await tx.creditTransaction.create({
        data: {
          handymanId: txn.handymanId,
          amount: refundAmount,
          type: "REFUND",
          referenceId: requestId,
          balanceBefore,
          balanceAfter,
          reason: "SPAM/BYPASS – lead označen kao spam od strane admina",
          createdByAdminId: adminId,
        },
      });

      totalRefunded += refundAmount;
    }
  });

  return {
    refundCount: unlockTxns.length,
    totalCreditsRefunded: totalRefunded,
    alreadyRefunded: false,
  };
}
