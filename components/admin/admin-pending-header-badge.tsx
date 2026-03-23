"use client";

import Link from "next/link";
import type { AdminPendingReviewCounts } from "@/lib/admin-pending-counts";

export function AdminPendingHeaderBadge({ counts }: { counts: AdminPendingReviewCounts }) {
  const total = counts.pendingRequests + counts.pendingHandymen;
  if (total === 0) return null;

  return (
    <Link
      href="/admin/moderation"
      className="flex max-w-[min(100vw-8rem,20rem)] flex-col gap-0.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5 text-left transition hover:bg-amber-100 sm:max-w-none sm:flex-row sm:items-center sm:gap-2 sm:px-3"
    >
      <span className="text-[11px] font-bold uppercase tracking-wide text-amber-900 sm:text-xs">Na čekanju</span>
      <span className="text-xs font-semibold text-amber-950 sm:text-sm">
        {counts.pendingRequests} zahtjeva · {counts.pendingHandymen} majstora
      </span>
      {counts.urgentPendingRequests > 0 && (
        <span className="text-[11px] font-semibold text-red-700 sm:text-xs">
          Hitno: {counts.urgentPendingRequests}
        </span>
      )}
    </Link>
  );
}
