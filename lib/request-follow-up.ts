import type { RequestAdminStatus, RequestStatus } from "@prisma/client";
import { isApprovedForHandymen } from "@/lib/request-approval-gates";

/** Nakon koliko dana prikazati podsetnik vlasniku zahtjeva na dashboardu */
export const REQUEST_OWNER_FOLLOW_UP_MIN_DAYS = 5;

export type FollowUpEligibility = {
  status: RequestStatus;
  adminStatus: RequestAdminStatus | null;
  deletedAt: Date | null;
  createdAt: Date;
};

export function shouldShowOwnerFollowUp(input: FollowUpEligibility): boolean {
  if (input.deletedAt != null) return false;
  if (input.status !== "OPEN" && input.status !== "IN_PROGRESS") return false;

  const ageMs = Date.now() - new Date(input.createdAt).getTime();
  const minMs = REQUEST_OWNER_FOLLOW_UP_MIN_DAYS * 24 * 60 * 60 * 1000;
  if (ageMs < minMs) return false;

  if (input.status === "IN_PROGRESS") return true;

  return isApprovedForHandymen({
    status: input.status,
    adminStatus: input.adminStatus,
    deletedAt: input.deletedAt,
  });
}
