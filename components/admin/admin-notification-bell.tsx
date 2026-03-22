"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  queueCount: number;
};

/**
 * Zvonce + badge (broj stavki u redu čekanja za moderaciju).
 * Vodi na feed obavještenja sa direktnim linkovima.
 */
export function AdminNotificationBell({ queueCount }: Props) {
  const showBadge = queueCount > 0;
  const label = showBadge
    ? `Obavještenja, ${queueCount} na čekanju za pregled`
    : "Obavještenja moderacije";

  return (
    <Link
      href="/admin/notifications"
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] transition-colors hover:bg-[#F8FAFC]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      )}
      aria-label={label}
      title={label}
    >
      <Bell className="h-5 w-5" aria-hidden />
      {showBadge && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
          {queueCount > 99 ? "99+" : queueCount}
        </span>
      )}
    </Link>
  );
}
