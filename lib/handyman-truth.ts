/**
 * Jedinstveni izvor istine za brojanje i listanje majstora (admin, javni sajt, distribucija, KPI).
 *
 * Aktivan majstor (javno vidljiv / „stvarno aktivan“):
 * - User.role === HANDYMAN
 * - handymanProfile.workerStatus === ACTIVE
 * - bannedAt == null, suspendedAt == null
 * - email nije demo/test (lib/demo-email)
 *
 * Pending majstor (moderacija):
 * - workerStatus === PENDING_REVIEW
 * - email nije demo/test
 */

import type { Prisma } from "@prisma/client";
import { prismaWhereHandymanEmailNotDemo } from "@/lib/demo-email";

/** User-level where za findMany (listing, homepage) — aktivan majstor. */
export function prismaWhereUserActiveHandymanTruth(): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    bannedAt: null,
    suspendedAt: null,
    ...prismaWhereHandymanEmailNotDemo(),
    handymanProfile: { workerStatus: "ACTIVE" },
  };
}

/**
 * Isto što i `prismaWhereUserActiveHandymanTruth`, plus dodatni uslovi na profilu (kategorija, distribucija).
 * Koristi `is` da se svi uslovi na profilu spoje u jedan HandymanProfile filter.
 */
export function prismaWhereUserActiveHandymanWithProfileExtra(
  extra: Prisma.HandymanProfileWhereInput
): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    bannedAt: null,
    suspendedAt: null,
    ...prismaWhereHandymanEmailNotDemo(),
    handymanProfile: {
      is: {
        workerStatus: "ACTIVE",
        ...extra,
      },
    },
  };
}

/** Za `handymanProfile.count` — isti semantički skup kao aktivni User gore. */
export function prismaWhereHandymanProfileActiveTruth(): Prisma.HandymanProfileWhereInput {
  return {
    workerStatus: "ACTIVE",
    user: {
      role: "HANDYMAN",
      bannedAt: null,
      suspendedAt: null,
      ...prismaWhereHandymanEmailNotDemo(),
    },
  };
}

export function prismaWhereHandymanProfilePendingTruth(): Prisma.HandymanProfileWhereInput {
  return {
    workerStatus: "PENDING_REVIEW",
    user: { role: "HANDYMAN", ...prismaWhereHandymanEmailNotDemo() },
  };
}

/** User-level where za listanje majstora na čekanju (moderacija). */
export function prismaWhereUserPendingHandymanTruth(): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    ...prismaWhereHandymanEmailNotDemo(),
    handymanProfile: { workerStatus: "PENDING_REVIEW" },
  };
}

/** Admin lista „svi“ osim demo — bez filtriranja po workerStatus. */
export function prismaWhereAdminHandymanUserBase(): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    ...prismaWhereHandymanEmailNotDemo(),
  };
}
