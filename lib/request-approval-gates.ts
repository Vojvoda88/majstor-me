import type { RequestAdminStatus, RequestStatus } from "@prisma/client";

const APPROVED_DISTRIBUTION_STATUSES = new Set<RequestAdminStatus>([
  "DISTRIBUTED",
  "HAS_OFFERS",
  "CONTACT_UNLOCKED",
]);

type LeadGateInput = {
  status: RequestStatus;
  adminStatus: RequestAdminStatus | null;
  deletedAt: Date | null;
};

/** Lead je vidljiv handymen toku tek nakon admin odobrenja/distribucije. */
export function isApprovedForHandymen(input: LeadGateInput): boolean {
  if (input.status !== "OPEN") return false;
  if (input.deletedAt != null) return false;
  if (!input.adminStatus) return false;
  return APPROVED_DISTRIBUTION_STATUSES.has(input.adminStatus);
}

/** Request smije ići u distribuciju notifikacija samo kad je zaista approved. */
export function canDistributeRequestToHandymen(input: LeadGateInput): boolean {
  return isApprovedForHandymen(input);
}

