"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Wrench, MapPin, CheckCircle2 } from "lucide-react";

export type HandymanCardData = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  verifiedStatus?: string;
};

type HandymanCardProps = HandymanCardData & {
  variant?: "compact" | "full";
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
  variant = "full",
}: HandymanCardProps) {
  const isVerified = verifiedStatus === "VERIFIED";
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  if (variant === "compact") {
    return (
      <Link
        href={`/handyman/${id}`}
        className="flex items-center gap-4 rounded-2xl border border-white bg-white p-4 shadow-sm transition hover:shadow-md"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name ?? "Majstor"} width={56} height={56} className="object-cover" loading="lazy" sizes="56px" />
          ) : (
            <span className="text-lg font-bold text-blue-600">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-slate-900">{name || "Majstor"}</h3>
            {isVerified && (
              <span className="inline-flex items-center gap-0.5 text-emerald-600" title="Verifikovan majstor">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {city || "Crna Gora"}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{ratingAvg.toFixed(1)}</span>
            <span className="text-slate-400">({reviewCount} recenzija)</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/handyman/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
    >
      <div className="flex h-24 items-center justify-center bg-slate-50">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-100">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name ?? "Majstor"} width={64} height={64} className="object-cover" loading="lazy" sizes="64px" />
          ) : (
            <Wrench className="h-8 w-8 text-blue-600" />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-slate-900">{name || "Majstor"}</h3>
          {isVerified && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600" title="Verifikovan majstor">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {categories[0] || "Majstor"} • {city || "Crna Gora"}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">{ratingAvg.toFixed(1)}</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{reviewCount} recenzija</span>
        </div>
        <span className="mt-3 inline-flex w-full justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition group-hover:bg-blue-700">
          Pogledaj profil
        </span>
      </div>
    </Link>
  );
}

export const HandymanCard = memo(HandymanCardComponent);
