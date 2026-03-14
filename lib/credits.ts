/**
 * Krediti za majstore – slanje ponude troši 1 kredit.
 * Arhitektura spremna za payment gateway (Stripe, itd.).
 *
 * CREDITS_REQUIRED=true u .env aktivira provjeru. Bez toga, ponude su besplatne.
 */

import type { Prisma } from "@prisma/client";

export const CREDITS_PER_OFFER = 1; // Nije više korišten - ponude su besplatne
export const CREDITS_PER_CONTACT_UNLOCK = 1;

export function isCreditsRequired(): boolean {
  return process.env.CREDITS_REQUIRED === "true";
}

export type SpendCreditsResult =
  | { ok: true; balanceAfter: number }
  | { ok: false; error: string; balance: number };

/**
 * Potroši kredite za slanje ponude. Vraća balanceAfter ili error.
 */
export async function spendCreditsForOffer(
  prisma: { handymanProfile: { findUnique: any; update: any }; creditTransaction: { create: any }; $transaction: any },
  handymanId: string,
  offerId: string
): Promise<SpendCreditsResult> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });

  if (!profile) {
    return { ok: false, error: "Profil nije pronađen", balance: 0 };
  }

  const balance = (profile as { creditsBalance?: number }).creditsBalance ?? 0;

  if (balance < CREDITS_PER_OFFER) {
    return {
      ok: false,
      error: `Nemate dovoljno kredita. Potrebno: ${CREDITS_PER_OFFER}, imate: ${balance}. Kupite kredite da biste mogli slati ponude.`,
      balance,
    };
  }

  const balanceAfter = balance - CREDITS_PER_OFFER;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.handymanProfile.update({
      where: { userId: handymanId },
      data: { creditsBalance: balanceAfter },
    });
    await tx.creditTransaction.create({
      data: {
        handymanId,
        amount: -CREDITS_PER_OFFER,
        type: "OFFER_SENT",
        referenceId: offerId,
        balanceAfter,
      },
    });
  });

  return { ok: true, balanceAfter };
}

/**
 * Provjeri da li majstor ima dovoljno kredita.
 */
export async function hasEnoughCredits(
  prisma: { handymanProfile: { findUnique: any } },
  handymanId: string
): Promise<{ ok: boolean; balance: number }> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });
  const balance = (profile as { creditsBalance?: number } | null)?.creditsBalance ?? 0;
  return { ok: balance >= CREDITS_PER_OFFER, balance };
}

/**
 * Potroši kredite za otključavanje kontakta korisnika. Vraća balanceAfter ili error.
 */
export async function spendCreditsForContactUnlock(
  prisma: { handymanProfile: { findUnique: any; update: any }; creditTransaction: { create: any }; $transaction: any },
  handymanId: string,
  requestId: string
): Promise<SpendCreditsResult> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });

  if (!profile) {
    return { ok: false, error: "Profil nije pronađen", balance: 0 };
  }

  const balance = (profile as { creditsBalance?: number }).creditsBalance ?? 0;

  if (balance < CREDITS_PER_CONTACT_UNLOCK) {
    return {
      ok: false,
      error: `Nemate dovoljno kredita. Potrebno: ${CREDITS_PER_CONTACT_UNLOCK}, imate: ${balance}. Kupite kredite da biste mogli vidjeti broj telefona.`,
      balance,
    };
  }

  const balanceAfter = balance - CREDITS_PER_CONTACT_UNLOCK;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.handymanProfile.update({
      where: { userId: handymanId },
      data: { creditsBalance: balanceAfter },
    });
    await tx.creditTransaction.create({
      data: {
        handymanId,
        amount: -CREDITS_PER_CONTACT_UNLOCK,
        type: "CONTACT_UNLOCK",
        referenceId: requestId,
        balanceAfter,
      },
    });
  });

  return { ok: true, balanceAfter };
}

/**
 * Provjeri da li majstor ima dovoljno kredita za otključaj kontakta.
 */
export async function hasEnoughCreditsForUnlock(
  prisma: { handymanProfile: { findUnique: any } },
  handymanId: string
): Promise<{ ok: boolean; balance: number }> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanId },
    select: { creditsBalance: true },
  });
  const balance = (profile as { creditsBalance?: number } | null)?.creditsBalance ?? 0;
  return { ok: balance >= CREDITS_PER_CONTACT_UNLOCK, balance };
}
