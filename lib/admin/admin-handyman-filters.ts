/**
 * Izvor istine za admin KPI / liste majstora — usklađeno sa javnim listingom (getTopHandymenForHome):
 * - workerStatus ACTIVE na profilu
 * - User nije banned/suspended
 * - email nije demo/test (@local.majstor.demo, @test.me)
 *
 * „Aktivan majstor“ u smislu poslovanja = ovaj skup.
 */
import type { Prisma } from "@prisma/client";
import { prismaWhereHandymanEmailNotDemo } from "@/lib/demo-email";

/** Broj majstora za KPI „aktivni“ (dashboard kartica). */
export function prismaWhereHandymanProfileActiveKpi(): Prisma.HandymanProfileWhereInput {
  return {
    workerStatus: "ACTIVE",
    user: {
      bannedAt: null,
      suspendedAt: null,
      ...prismaWhereHandymanEmailNotDemo(),
    },
  };
}

/** User where za admin listu — isključuje demo/test da KPI i lista budu dosljedni. */
export function prismaWhereAdminHandymanUserBase(): Prisma.UserWhereInput {
  return {
    role: "HANDYMAN",
    ...prismaWhereHandymanEmailNotDemo(),
  };
}

/** Pending review broj (moderation badge) — bez demo/test naloga u broju. */
export function prismaWhereHandymanPendingReviewKpi(): Prisma.HandymanProfileWhereInput {
  return {
    workerStatus: "PENDING_REVIEW",
    user: { ...prismaWhereHandymanEmailNotDemo() },
  };
}
