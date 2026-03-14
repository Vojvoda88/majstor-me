"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle2 } from "lucide-react";
import { HERO_IMAGE } from "@/lib/homepage-data";

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
};

export function CategoryHandymanCard({
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
  const imgSrc = avatarUrl ?? HERO_IMAGE;
  const primaryCategory = categories[0] || "Majstor";

  const badges = [
    isVerified && { label: "Verifikovan", style: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]" },
    reviewCount > 0 && { label: `${reviewCount} recenzija`, style: "bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]" },
    averageResponseMinutes != null && { label: `~${averageResponseMinutes} min`, style: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]" },
    completedJobsCount != null && completedJobsCount > 0 && { label: `${completedJobsCount} poslova`, style: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" },
  ].filter(Boolean) as { label: string; style: string }[];

  const shortDescription = `Specijalizovan za ${primaryCategory}. Kontaktirajte za besplatnu procjenu i brzu ponudu.`;

  return (
    <Link
      href={`/handyman/${id}`}
      className="block overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-md transition hover:shadow-lg"
    >
      {/* Desktop: grid layout */}
      <div className="hidden lg:grid lg:grid-cols-[320px_minmax(0,1fr)_200px] lg:gap-0">
        {/* Left: Image */}
        <div className="relative min-h-[260px] w-full">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>

        {/* Center: Info */}
        <div className="flex flex-col justify-center p-8">
          <h3 className="text-[34px] font-bold leading-tight text-[#0F172A]">
            {name || "Majstor"}
          </h3>
          <p className="mt-2 text-[20px] text-[#475569]">
            {primaryCategory} • {city || "Crna Gora"}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`rounded-full border px-4 py-2 text-[14px] font-medium ${b.style}`}
              >
                {b.label.startsWith("Verifikovan") ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {b.label}
                  </span>
                ) : (
                  b.label
                )}
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-[#475569] line-clamp-2">
            {shortDescription}
          </p>
        </div>

        {/* Right: Rating + CTA */}
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FEF3C7] px-4 py-2 text-[#92400E]">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-[28px] font-bold">{ratingAvg.toFixed(1)}</span>
            </div>
            {reviewCount > 0 && (
              <p className="mt-2 text-sm text-[#64748B]">
                {reviewCount} {reviewCount === 1 ? "recenzija" : "recenzija"}
              </p>
            )}
          </div>
          <span className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-[#2563EB] text-[18px] font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]">
            Pogledaj profil
          </span>
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="block lg:hidden">
        <div className="relative h-[190px] w-full">
          <Image
            src={imgSrc}
            alt=""
            fill
            className="object-cover"
            sizes="430px"
          />
        </div>
        <div className="p-5">
          <h3 className="text-2xl font-bold text-[#0F172A]">
            {name || "Majstor"}
          </h3>
          <p className="mt-1 text-base text-[#475569]">
            {primaryCategory} • {city || "Crna Gora"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.label}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${b.style}`}
              >
                {b.label.startsWith("Verifikovan") ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verifikovan
                  </span>
                ) : (
                  b.label
                )}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-3 py-1.5 text-sm font-semibold text-[#92400E]">
              <Star className="h-4 w-4 fill-current" />
              {ratingAvg.toFixed(1)}
            </div>
            <span className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#2563EB] text-base font-semibold text-white shadow-sm">
              Pogledaj profil
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
