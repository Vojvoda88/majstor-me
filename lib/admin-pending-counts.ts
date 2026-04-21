import { cache } from "react";
import { prismaWhereHandymanPendingReviewKpi } from "@/lib/admin/admin-handyman-filters";

export type AdminPendingReviewCounts = {
  pendingRequests: number;
  pendingHandymen: number;
  /** Zahtjevi na čekanju sa hitnošću „danas“ */
  urgentPendingRequests: number;
};

const EMPTY_PENDING_COUNTS: AdminPendingReviewCounts = {
  pendingRequests: 0,
  pendingHandymen: 0,
  urgentPendingRequests: 0,
};

let pendingCountsCache: { value: AdminPendingReviewCounts; ts: number } | null = null;
const PENDING_COUNTS_TTL_MS = 20_000;

/**
 * Broj stvari koje čekaju admin akciju (za badge u admin shell-u i dashboard).
 */
export const getAdminPendingReviewCounts = cache(async (): Promise<AdminPendingReviewCounts> => {
  const now = Date.now();
  if (pendingCountsCache && now - pendingCountsCache.ts < PENDING_COUNTS_TTL_MS) {
    return pendingCountsCache.value;
  }

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

  const value = { pendingRequests, pendingHandymen, urgentPendingRequests };
  pendingCountsCache = { value, ts: now };
  return value;
});
