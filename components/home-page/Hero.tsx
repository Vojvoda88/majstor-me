import Image from "next/image";
import { ShieldCheck, Star, MapPin } from "lucide-react";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl sm:mb-12 lg:mb-16">
      <div className="relative flex min-h-[360px] items-center py-8 sm:min-h-[400px] sm:py-10 lg:h-[420px] lg:py-0">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            className="object-cover object-[65%_center] sm:object-[70%_center]"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/50 sm:bg-gradient-to-r sm:from-slate-900/85 sm:via-slate-900/55 sm:to-slate-900/25 backdrop-blur-[1px] sm:backdrop-blur-[2px]"
            aria-hidden
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Pronađite majstora u blizini za nekoliko minuta
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:mt-4 sm:text-base lg:text-lg">
              Provjereni majstori, brze ponude — cijela Crna Gora.
            </p>
            <div className="mt-5 sm:mt-6 lg:mt-8">
              <HeroSearch />
            </div>
            <div className="mt-5 flex flex-wrap gap-4 gap-y-2 text-xs text-white/90 sm:mt-6 sm:gap-5 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-300 sm:h-5 sm:w-5" />
                Verifikovani
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400 sm:h-5 sm:w-5" />
                4.8 od korisnika
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-300 sm:h-5 sm:w-5" />
                Cijela Crna Gora
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
