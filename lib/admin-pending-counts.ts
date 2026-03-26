import { cache } from "react";
import { prismaWhereHandymanPendingReviewKpi } from "@/lib/admin/admin-handyman-filters";

export type AdminPendingReviewCounts = {
  pendingRequests: number;
  pendingHandymen: number;
  /** Zahtjevi na čekanju sa hitnošću „danas“ */
  urgentPendingRequests: number;
};

/**
 * Broj stvari koje čekaju admin akciju (za badge u admin shell-u i dashboard).
 */
export const getAdminPendingReviewCounts = cache(async (): Promise<AdminPendingReviewCounts> => {
  const { prisma } = await import("@/lib/db");

  const openPendingRequestWhere = {
    status: "OPEN" as const,
    OR: [{ adminStatus: "PENDING_REVIEW" as const }, { adminStatus: null }],
  };

  const [pendingRequests, pendingHandymen, urgentPendingRequests] = await Promise.all([
    prisma.request.count({ where: openPendingRequestWhere }),
    prisma.handymanProfile.count({ where: prismaWhereHandymanPendingReviewKpi() }),
    prisma.request.count({
      where: {
        ...openPendingRequestWhere,
        urgency: "HITNO_DANAS",
      },
    }),
  ]);

  return { pendingRequests, pendingHandymen, urgentPendingRequests };
});
