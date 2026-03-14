"use client";

import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

export function StickyBottomCTA({ href, label }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[#E2E8F0] bg-[rgba(255,255,255,0.92)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-[16px] md:hidden">
      <Link
        href={href}
        className="flex h-14 w-full items-center justify-center rounded-xl bg-[#2563EB] text-lg font-semibold text-white transition hover:bg-[#1D4ED8] active:scale-[0.98]"
      >
        {label}
      </Link>
    </div>
  );
}
