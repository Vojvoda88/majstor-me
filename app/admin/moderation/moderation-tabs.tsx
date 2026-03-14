"use client";

import Link from "next/link";

const TABS = [
  { id: "requests", label: "Pending Requests" },
  { id: "workers", label: "Pending Workers" },
  { id: "reports", label: "Reported Items" },
  { id: "spam", label: "Spam" },
] as const;

export function ModerationTabs({ currentTab }: { currentTab: string }) {
  return (
    <div className="flex gap-2 border-b border-[#E2E8F0]">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={`/admin/moderation?tab=${t.id}`}
          className={`px-4 py-2 text-sm font-medium ${
            currentTab === t.id
              ? "border-b-2 border-[#2563EB] text-[#2563EB]"
              : "text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
