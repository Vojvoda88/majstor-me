/**
 * Krediti za majstore – interna valuta. Otključavanje kontakta troši oko 200–650 kredita (hitnost + dodatci).
 * Slanje ponude je besplatno NAKON otključavanja leada.
 *
 * CREDITS_REQUIRED=true u .env aktivira provjeru. Bez toga, lead unlock je besplatan.
 */

import { Prisma } from "@prisma/client";
import { getCreditsForLead } from "@/lib/lead-tier";

export function isCreditsRequired(): boolean {
  const raw = (process.env.CREDITS_REQUIRED ?? "").trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") return false;
  return true;
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
 * Proveri da li majstor ima dovoljno kredita za otključaj leada.
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
  console.info("[UnlockContactAPI]", {
    step: "tx_start",
    requestId,
    handymanId,
    chargeCredits,
    creditsRequired,
  });

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
        console.info("[UnlockContactAPI]", { step: "unlock_create_start", requestId, handymanId });
        await tx.requestContactUnlock.create({
          data: { requestId, handymanId },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          if (chargeCredits) {
            const charged = await tx.creditTransaction.findFirst({
              where: {
                handymanId,
                referenceId: requestId,
                type: "CONTACT_UNLOCK",
              },
              select: { id: true },
            });
            if (!charged) {
              return {
                ok: false,
                error: "Kontakt je već otključan, ali naplata nije evidentirana. Kontaktirajte podršku.",
                balance,
              } as const;
            }
          }
          return { ok: true, balanceAfter: balance, alreadyUnlocked: true } as const;
        }
        throw e;
      }

      if (!chargeCredits) {
        console.info("[UnlockContactAPI]", { step: "tx_success", requestId, handymanId, charged: false });
        return { ok: true, balanceAfter: null, alreadyUnlocked: false } as const;
      }

      console.info("[UnlockContactAPI]", { step: "debit_start", requestId, handymanId, creditsRequired });
      const rows = await tx.$queryRaw<Array<{ balance_before: bigint | number; balance_after: bigint | number }>>`
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

      const balanceBefore = Number(rows[0].balance_before);
      const balanceAfter = Number(rows[0].balance_after);
      if (!Number.isFinite(balanceBefore) || !Number.isFinite(balanceAfter)) {
        throw new Error("INVALID_CREDIT_BALANCE_NUMBER");
      }

      await tx.creditTransaction.create({
        data: {
          handymanId,
          amount: -creditsRequired,
          type: "CONTACT_UNLOCK",
          referenceId: requestId,
          balanceBefore,
          balanceAfter,
        },
      });
      console.info("[UnlockContactAPI]", {
        step: "tx_success",
        requestId,
        handymanId,
        charged: true,
        balanceBefore,
        balanceAfter,
      });

      return { ok: true, balanceAfter, alreadyUnlocked: false } as const;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_CREDITS_RACE") {
      return {
        ok: false,
        error: "Nemate dovoljno kredita za ovaj kontakt.",
        balance: 0,
      };
    }
    console.error("[UnlockContactAPI]", {
      step: "fatal",
      requestId,
      handymanId,
      message: e instanceof Error ? e.message : String(e),
    });
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
