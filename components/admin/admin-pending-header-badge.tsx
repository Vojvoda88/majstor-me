"use client";

import Link from "next/link";
import type { AdminPendingReviewCounts } from "@/lib/admin-pending-counts";

export function AdminPendingHeaderBadge({ counts }: { counts: AdminPendingReviewCounts }) {
  const total = counts.pendingRequests + counts.pendingHandymen;
  if (total === 0) return null;

  return (
    <Link
      href="/admin/moderation"
      className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border border-amber-200/90 bg-amber-50/95 px-2.5 py-1.5 text-left shadow-sm transition hover:bg-amber-100/90 sm:gap-2 sm:px-3"
    >
      <span className="shrink-0 rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 sm:text-[11px]">
        Na čekanju
      </span>
      <span className="truncate text-[11px] font-semibold text-amber-950 sm:text-xs">
        {counts.pendingRequests} zahtj. · {counts.pendingHandymen} maj.
      </span>
      {counts.urgentPendingRequests > 0 && (
        <span className="shrink-0 rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 sm:text-[11px]">
          Hitno: {counts.urgentPendingRequests}
        </span>
      )}
    </Link>
  );
}
