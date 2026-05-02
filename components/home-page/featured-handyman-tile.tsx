"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, User } from "lucide-react";
import { displayLabelForRequestCategory } from "@/lib/categories";
import { AVATAR_IMAGE_FALLBACK } from "@/lib/homepage-data";
import type { PublicHandymanListItem } from "@/lib/handymen-listing";

type Props = { item: PublicHandymanListItem };

type ImgLayer = "gallery" | "avatar" | "fallback" | "placeholder";

export function FeaturedHandymanTile({ item }: Props) {
  const displayName = item.name?.trim() || "Majstor";
  const gallery = item.firstGalleryImageUrl?.trim();
  const avatar = item.avatarUrl?.trim();

  const initialLayer = (): ImgLayer => {
    if (gallery) return "gallery";
    if (avatar) return "avatar";
    return "fallback";
  };

  const [layer, setLayer] = useState<ImgLayer>(initialLayer);

  const src =
    layer === "gallery" && gallery
      ? gallery
      : layer === "avatar" && avatar
        ? avatar
        : layer === "fallback"
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
      setLayer("fallback");
      return;
    }
    if (layer === "fallback") {
      setLayer("placeholder");
    }
  };

  return (
    <Link
      href={`/handyman/${item.id}`}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-[0_12px_36px_-14px_rgba(10,22,40,0.2)] ring-1 ring-slate-900/[0.06] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-[0_20px_44px_-14px_rgba(10,22,40,0.24)] md:aspect-[16/11] md:rounded-3xl"
    >
      {layer === "placeholder" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-navy via-[#132d52] to-slate-900">
          <User className="h-14 w-14 text-white/25" strokeWidth={1.25} aria-hidden />
        </div>
      ) : (
        <Image
          src={src}
          alt={displayName}
          fill
          className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.025]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          onError={handleError}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.88] via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        {item.city ? (
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/80">
            {item.city}
          </span>
        ) : null}
        <span className="block font-display text-lg font-bold tracking-tight text-white drop-shadow-sm md:text-xl">
          {displayName}
        </span>
        <span className="mt-1.5 block text-sm font-medium leading-snug text-white/[0.92] line-clamp-2">
          {subtitle}
        </span>
        <span className="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-200/95">
          Pogledaj
          <ArrowRight className="h-3.5 w-3.5 transition duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
