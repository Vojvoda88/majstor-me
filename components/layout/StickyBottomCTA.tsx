"use client";

import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

export function StickyBottomCTA({ href, label }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
      <Link
        href={href}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#1d4ed8] text-[17px] font-bold text-white shadow-premium transition hover:bg-[#1e40af] active:scale-[0.98]"
        data-testid="sticky-cta"
      >
        {label}
      </Link>
    </div>
  );
}
