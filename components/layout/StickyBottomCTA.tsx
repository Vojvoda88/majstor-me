"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

type Props = {
  href: string;
  label: string;
};

/** Minimalan mobilni CTA — diskretan, bez „jeftinog“ plavog gradienta */
export function StickyBottomCTA({ href, label }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-[0_-4px_24px_rgba(10,22,40,0.06)] backdrop-blur-md md:hidden">
      <Link
        href={href}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-brand-navy text-[15px] font-semibold text-white shadow-sm transition hover:bg-brand-navy/95 active:scale-[0.99]"
        data-testid="sticky-cta"
      >
        <FileText className="h-4 w-4 opacity-90" aria-hidden />
        {label}
      </Link>
    </div>
  );
}
