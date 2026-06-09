"use client";

import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

/** Mobilni sticky CTA — isti premium plavi gradient kao hero. */
export function StickyBottomCTA({ href, label }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200/70 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(15,23,42,0.1)] backdrop-blur-xl md:hidden">
      <Link
        href={href}
        className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-6 text-[15px] font-bold text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/20 transition hover:brightness-105 active:scale-[0.98]"
        data-testid="sticky-cta"
      >
        {label}
      </Link>
    </div>
  );
}
