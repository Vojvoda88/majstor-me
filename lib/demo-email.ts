/**
 * Jedan izvor za prepoznavanje demo / test naloga (seed-demo, prisma/seed test).
 * Koristi se za isključenje iz distribucije (toNotify) i javnog listinga majstora.
 */

import type { Prisma } from "@prisma/client";

export const DEMO_EMAIL_SUFFIX = "@local.majstor.demo";

/** Korisnici iz prisma/seed.ts (npr. marko@test.me) */
export const TEST_ME_EMAIL_SUFFIX = "@test.me";

/** Ne uključivati u distribuciju push/notifikacija i u javni handyman listing */
export const DISTRIBUTION_EXCLUDED_EMAIL_SUFFIXES = [
  DEMO_EMAIL_SUFFIX,
  TEST_ME_EMAIL_SUFFIX,
] as const;

/** Prisma `where` kompatibilan: NOT (email endsWith any of these) */
export function prismaWhereHandymanEmailNotDemo(): Pick<Prisma.UserWhereInput, "NOT"> {
  return {
    NOT: {
      OR: [
        { email: { endsWith: DEMO_EMAIL_SUFFIX } },
        { email: { endsWith: TEST_ME_EMAIL_SUFFIX } },
      ],
    },
  };
}
