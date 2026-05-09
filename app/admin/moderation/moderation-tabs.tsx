"use client";

import Link from "next/link";

const TABS = [
  { id: "requests", label: "Zahtjevi na čekanju" },
  { id: "workers", label: "Majstori na čekanju" },
  { id: "reports", label: "Prijave" },
  { id: "spam", label: "Spam" },
] as const;

export function ModerationTabs({ currentTab }: { currentTab: string }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={`/admin/moderation?tab=${t.id}`}
          className={`px-4 py-2 text-sm font-medium ${
            currentTab === t.id
              ? "rounded-xl bg-[#2563EB] text-white shadow-sm"
              : "rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
