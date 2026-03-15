"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2 } from "lucide-react";
import { AVATAR_IMAGE_FALLBACK } from "@/lib/homepage-data";

type Props = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  verifiedStatus?: string;
  completedJobsCount?: number;
  averageResponseMinutes?: number | null;
  isPromoted?: boolean;
};

export function PremiumHandymanCard({
  id,
  name,
  city,
  categories,
  ratingAvg,
  reviewCount,
  avatarUrl,
  verifiedStatus,
  completedJobsCount,
  averageResponseMinutes,
}: Props) {
  const isVerified = verifiedStatus === "VERIFIED";
  const imgSrc = avatarUrl ?? AVATAR_IMAGE_FALLBACK;

  return (
    <Link
      href={`/handyman/${id}`}
      className="mb-4 block overflow-hidden rounded-[22px] border border-[#E7EDF5] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition active:scale-[0.99]"
    >
      <div className="relative h-[160px] w-full">
        <Image src={imgSrc} alt="" fill className="object-cover" sizes="430px" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-[#0F172A]">{name || "Majstor"}</h3>
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-sm font-semibold text-amber-800">
            ⭐ {ratingAvg.toFixed(1)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[#475569]">
          {categories[0] || "Majstor"} • {city || "Crna Gora"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {isVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
            </span>
          )}
          {averageResponseMinutes != null && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              ~{averageResponseMinutes} min
            </span>
          )}
          {completedJobsCount != null && completedJobsCount > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {completedJobsCount} poslova
            </span>
          )}
          {reviewCount > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {reviewCount} recenzija
            </span>
          )}
        </div>
        <span className="mt-3 flex h-[46px] w-full items-center justify-center rounded-[12px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
          Pogledaj profil
        </span>
      </div>
    </Link>
  );
}
