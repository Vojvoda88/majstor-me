"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Wrench, CheckCircle2, Clock, Briefcase, Award } from "lucide-react";
import { HERO_IMAGE } from "@/lib/homepage-data";

export type HandymanCardData = {
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
  availabilityStatus?: string | null;
  isPromoted?: boolean;
};

type HandymanCardProps = HandymanCardData & {
  variant?: "compact" | "full" | "list";
};

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Dostupan",
  BUSY: "Zauzet",
  EMERGENCY_ONLY: "Samo hitne",
};

function HandymanCardComponent({
  id,
  name,
  city,
  categories,
  ratingAvg,
  reviewCount,
  avatarUrl,
  verifiedStatus,
  completedJobsCount = 0,
  averageResponseMinutes,
  availabilityStatus,
  isPromoted,
  variant = "full",
}: HandymanCardProps) {
  const isVerified = verifiedStatus === "VERIFIED";
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const badges = (
    <div className="mt-2 flex flex-wrap gap-2">
      {isVerified && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Verifikovan
        </span>
      )}
      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Star className="h-3.5 w-3.5 fill-amber-500" /> {ratingAvg.toFixed(1)} ({reviewCount})
      </span>
      {averageResponseMinutes != null && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          <Clock className="h-3.5 w-3.5" /> Odgovara za ~{averageResponseMinutes} min
        </span>
      )}
      {completedJobsCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          <Briefcase className="h-3.5 w-3.5" /> {completedJobsCount} poslova
        </span>
      )}
      {isPromoted && (
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          <Award className="h-3.5 w-3.5" /> Premium
        </span>
      )}
    </div>
  );

  const cardContent = (
    <>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 sm:h-20 sm:w-20">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name ?? "Majstor"} width={80} height={80} className="h-full w-full object-cover" loading="lazy" sizes="80px" />
          ) : (
            variant === "compact" ? (
              <span className="text-xl font-bold text-blue-600 sm:text-2xl">{initials}</span>
            ) : (
              <Wrench className="h-8 w-8 text-blue-600 sm:h-10 sm:w-10" />
            )
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{name || "Majstor"}</h3>
            <span className="flex items-center gap-1 text-amber-600">
              <Star className="h-4 w-4 fill-amber-500" /> {ratingAvg.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-600">
            {categories[0] || "Majstor"} • {city || "Crna Gora"}
          </p>
          {badges}
        </div>
      </div>
      <span className="mt-4 flex w-full min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white transition active:scale-[0.98] sm:mt-4 sm:inline-flex sm:w-auto sm:min-h-0 sm:py-2.5 sm:text-sm">
        Pogledaj profil
      </span>
    </>
  );

  if (variant === "list") {
    const imgSrc = avatarUrl ?? HERO_IMAGE;
    return (
      <Link
        href={`/handyman/${id}`}
        className="mb-4 block overflow-hidden rounded-[22px] border border-[#E7EDF5] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition active:scale-[0.99]"
      >
        <div className="relative h-[150px] w-full">
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
          <div className="mt-2 flex flex-wrap gap-2">{badges}</div>
          <span className="mt-3 flex h-[46px] w-full items-center justify-center rounded-[12px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]">
            Pogledaj profil
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/handyman/${id}`}
        className="flex flex-col rounded-[22px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition active:scale-[0.99] sm:flex-row sm:items-center sm:p-6"
      >
        <div className="flex w-full gap-4 sm:flex-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 sm:h-16 sm:w-16">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name ?? "Majstor"} width={64} height={64} className="object-cover" loading="lazy" sizes="64px" />
            ) : (
              <span className="text-lg font-bold text-blue-600 sm:text-xl">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">{name || "Majstor"}</h3>
            <p className="text-sm text-gray-600">
              {categories[0] || "Majstor"} • {city || "Crna Gora"}
            </p>
            {badges}
          </div>
        </div>
        <span className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-base font-semibold text-white sm:mt-3 sm:min-h-0 sm:w-auto sm:flex-initial sm:px-4 sm:py-2 sm:text-sm">
          Pogledaj profil →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/handyman/${id}`}
      className="group flex flex-col rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md active:scale-[0.99] sm:flex-row sm:items-start sm:gap-4 sm:p-6"
    >
      {cardContent}
    </Link>
  );
}

export const HandymanCard = memo(HandymanCardComponent);
