"use client";

import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  icon: React.ReactNode;
};

export function PremiumCategoryCard({ slug, name, icon }: Props) {
  return (
    <Link
      href={`/category/${slug}`}
      className="flex min-h-[92px] items-center gap-3 rounded-[18px] border border-[#E6EDF5] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#60A5FA]/20 to-[#2563EB]/15 text-[#2563EB]">
        {icon}
      </div>
      <span className="text-[15px] font-semibold text-[#0F172A]">{name}</span>
    </Link>
  );
}
