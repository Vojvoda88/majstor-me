/**
 * Krediti za majstore – interna valuta. Otključavanje kontakta troši oko 200–650 kredita (hitnost + dodatci).
 * Slanje ponude je besplatno NAKON otključavanja leada.
 *
 * CREDITS_REQUIRED=true u .env aktivira provjeru. Bez toga, lead unlock je besplatan.
 */

import { Prisma } from "@prisma/client";
import { getCreditsForLead } from "@/lib/lead-tier";

export function isCreditsRequired(): boolean {
  return process.env.CREDITS_REQUIRED === "true";
}

/** Prag ispod kojeg prikazujemo upozorenje "malo kredita" (ispod ~1,5 standardna otključavanja) */
export const LOW_CREDITS_THRESHOLD = 300;

export type SpendCreditsResult =
  | { ok: true; balanceAfter: number }
  | { ok: false; error: string; balance: number };

export type UnlockContactAtomicResult =
  | { ok: true; balanceAfter: number | null; alreadyUnlocked: boolean }
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

/**
 * Atomski unlock: request_contact_unlock + (opciono) skidanje kredita i ledger zapis.
 * Ako unlock već postoji, vraća alreadyUnlocked bez duplog trošenja.
 */
export async function createUnlockAndSpendCreditsAtomic(
  prisma: {
    $transaction: any;
  },
  input: {
    handymanId: string;
    requestId: string;
    creditsRequired: number;
    chargeCredits: boolean;
  }
): Promise<UnlockContactAtomicResult> {
  const { handymanId, requestId, creditsRequired, chargeCredits } = input;

  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const profile = await tx.handymanProfile.findUnique({
        where: { userId: handymanId },
        select: { creditsBalance: true },
      });
      if (!profile) {
        return { ok: false, error: "Profil nije pronađen", balance: 0 } as const;
      }

      const balance = profile.creditsBalance ?? 0;
      if (chargeCredits && balance < creditsRequired) {
        return {
          ok: false,
          error: `Nemate dovoljno kredita. Potrebno: ${creditsRequired}, imate: ${balance}. Kupite kredite da biste mogli uzeti kontakt.`,
          balance,
        } as const;
      }

      try {
        await tx.requestContactUnlock.create({
          data: { requestId, handymanId },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          return { ok: true, balanceAfter: balance, alreadyUnlocked: true } as const;
        }
        throw e;
      }

      if (!chargeCredits) {
        return { ok: true, balanceAfter: null, alreadyUnlocked: false } as const;
      }

      const rows = await tx.$queryRaw<Array<{ balance_before: number; balance_after: number }>>`
        UPDATE "handyman_profiles"
        SET "credits_balance" = "credits_balance" - ${creditsRequired}
        WHERE "user_id" = ${handymanId}
          AND "credits_balance" >= ${creditsRequired}
        RETURNING
          "credits_balance" + ${creditsRequired} AS balance_before,
          "credits_balance" AS balance_after
      `;

      if (rows.length !== 1) {
        throw new Error("INSUFFICIENT_CREDITS_RACE");
      }

      const { balance_before, balance_after } = rows[0];

      await tx.creditTransaction.create({
        data: {
          handymanId,
          amount: -creditsRequired,
          type: "CONTACT_UNLOCK",
          referenceId: requestId,
          balanceBefore: balance_before,
          balanceAfter: balance_after,
        },
      });

      return { ok: true, balanceAfter: balance_after, alreadyUnlocked: false } as const;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_CREDITS_RACE") {
      return {
        ok: false,
        error: "Nemate dovoljno kredita za ovaj kontakt.",
        balance: 0,
      };
    }
    throw e;
  }
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
