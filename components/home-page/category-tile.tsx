"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, type LucideIcon, ImageIcon } from "lucide-react";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80";

type Props = {
  href: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  FallbackIcon?: LucideIcon;
};

export function CategoryTile({ href, title, subtitle, imageSrc, FallbackIcon = ImageIcon }: Props) {
  const [src, setSrc] = useState(imageSrc);
  const [broken, setBroken] = useState(false);

  const handleError = () => {
    setBroken(true);
    setSrc(FALLBACK_IMG);
  };

  return (
    <Link
      href={href}
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/40 shadow-[0_16px_40px_-16px_rgba(10,22,40,0.18)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(10,22,40,0.22)] md:aspect-[16/11] md:rounded-3xl"
    >
      {!broken ? (
        <Image
          src={src}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          onError={handleError}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-navy via-[#132d52] to-slate-900">
          <FallbackIcon className="h-14 w-14 text-white/25" strokeWidth={1.25} aria-hidden />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <span className="block font-display text-lg font-bold tracking-tight text-white drop-shadow md:text-xl">
          {title}
        </span>
        <span className="mt-1 block text-sm font-medium leading-snug text-white/85">{subtitle}</span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200/95">
          Pogledaj
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
