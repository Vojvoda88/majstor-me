"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { displayLabelForRequestCategory } from "@/lib/categories";
import { getCategoryHeroImageForWorkerCategories } from "@/lib/category-images";
import { AVATAR_IMAGE_FALLBACK } from "@/lib/homepage-data";
import type { PublicHandymanListItem } from "@/lib/handymen-listing";

type Props = { item: PublicHandymanListItem };

type ImgLayer = "gallery" | "avatar" | "category" | "generic" | "placeholder";

export function FeaturedHandymanTile({ item }: Props) {
  const displayName = item.name?.trim() || "Majstor";
  const gallery = item.firstGalleryImageUrl?.trim();
  const avatar = item.avatarUrl?.trim();
  const categoryHeroUrl = getCategoryHeroImageForWorkerCategories(item.categories);

  const isVerified = item.verifiedStatus === "VERIFIED";
  const isPremium = item.isPromoted === true;
  const hasReviews = (item.reviewCount ?? 0) > 0;
  const jobs = item.completedJobsCount ?? 0;

  const initialLayer = (): ImgLayer => {
    if (gallery) return "gallery";
    if (avatar) return "avatar";
    return "category";
  };

  const [layer, setLayer] = useState<ImgLayer>(initialLayer);

  const src =
    layer === "gallery" && gallery
      ? gallery
      : layer === "avatar" && avatar
        ? avatar
        : layer === "category"
          ? categoryHeroUrl
          : layer === "generic"
            ? AVATAR_IMAGE_FALLBACK
            : "";

  const catLabels = item.categories
    .slice(0, 2)
    .map(displayLabelForRequestCategory)
    .filter(Boolean);
  const subtitle =
    item.bioSnippet ||
    (catLabels.length > 0 ? catLabels.join(" · ") : "Profil majstora");

  const handleError = () => {
    if (layer === "gallery" && avatar) {
      setLayer("avatar");
      return;
    }
    if (layer === "gallery" || layer === "avatar") {
      setLayer("category");
      return;
    }
    if (layer === "category") {
      setLayer("generic");
      return;
    }
    if (layer === "generic") {
      setLayer("placeholder");
    }
  };

  return (
    <div className="group/tile relative isolate h-full">
      {/* Ambijentalni glow — diskretan premium */}
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-[1.15rem] bg-gradient-to-br from-amber-400/35 via-sky-400/25 to-blue-600/40 opacity-0 blur-lg transition duration-500 ease-out group-hover/tile:opacity-100 md:rounded-[1.45rem]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.05rem] opacity-0 shadow-[0_0_32px_6px_rgba(59,130,246,0.22)] transition duration-500 group-hover/tile:opacity-100 md:rounded-[1.35rem]"
        aria-hidden
      />

      <Link
        href={`/handyman/${item.id}`}
        className="group relative z-10 flex aspect-[4/3] w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-100 shadow-[0_12px_40px_-14px_rgba(15,23,42,0.45),0_0_0_1px_rgba(255,255,255,0.06)] ring-1 ring-white/10 transition duration-300 ease-out hover:-translate-y-1 hover:border-amber-200/35 hover:shadow-[0_22px_56px_-16px_rgba(30,58,138,0.38),0_0_0_1px_rgba(251,191,36,0.22),0_0_40px_-8px_rgba(251,191,36,0.18)] md:aspect-[16/11] md:rounded-3xl"
      >
        {/* Suptilan sjaj pri hoveru */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition duration-500 group-hover:opacity-100"
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent" />
        </div>

        {layer === "placeholder" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-navy via-[#132d52] to-slate-900">
            <User className="h-14 w-14 text-white/25" strokeWidth={1.25} aria-hidden />
          </div>
        ) : (
          <Image
            src={src}
            alt={displayName}
            fill
            className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            onError={handleError}
          />
        )}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/[0.92] via-black/35 to-black/15" />

        {/* Trust / status bedževi */}
        <div className="absolute right-2.5 top-2.5 z-[3] flex max-w-[min(100%-1.25rem,14rem)] flex-wrap justify-end gap-1.5 sm:right-3 sm:top-3">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/45 bg-emerald-950/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-50 shadow-[0_0_18px_rgba(16,185,129,0.45)] backdrop-blur-md sm:px-2.5 sm:text-[11px]">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-200" aria-hidden />
              Verifikovan
            </span>
          ) : null}
          {isPremium ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-50 shadow-[0_0_22px_rgba(245,158,11,0.45)] backdrop-blur-md sm:px-2.5 sm:text-[11px]">
              <Award className="h-3 w-3 shrink-0 text-amber-200" aria-hidden />
              Premium
            </span>
          ) : null}
          {hasReviews ? (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-black/40 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-[0_0_16px_rgba(0,0,0,0.35)] backdrop-blur-md sm:gap-1 sm:px-2.5 sm:text-[11px]">
              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
              {item.ratingAvg.toFixed(1)}
              <span className="font-semibold text-white/75">({item.reviewCount})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/40 bg-sky-950/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.25)] backdrop-blur-md sm:px-2.5 sm:text-[11px]">
              <Sparkles className="h-3 w-3 shrink-0 text-sky-200" aria-hidden />
              Još nema ocjena
            </span>
          )}
          {jobs > 0 ? (
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-md">
              {jobs}+ poslova
            </span>
          ) : null}
        </div>

        <div className="relative z-[3] mt-auto p-5 md:p-6">
          {item.city ? (
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/80">
              {item.city}
            </span>
          ) : null}
          <span className="block font-display text-lg font-bold tracking-tight text-white drop-shadow-md md:text-xl">
            {displayName}
          </span>
          <span className="mt-1.5 block text-sm font-medium leading-snug text-white/[0.92] line-clamp-2 drop-shadow">
            {subtitle}
          </span>
          <span className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/95 drop-shadow-sm">
            Pogledaj
            <ArrowRight className="h-3.5 w-3.5 transition duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
