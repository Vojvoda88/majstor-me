import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Star, MapPin } from "lucide-react";
import { HeroSearch } from "./hero-search";
import { HERO_IMAGE } from "@/lib/homepage-data";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_16px_60px_rgba(15,23,42,0.1)]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Majstor radi posao u kući"
          fill
          className="object-cover object-[65%_center] lg:object-[70%_center]"
          priority
          sizes="(max-width: 1024px) 100vw, 1440px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/8 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 grid min-h-[480px] items-stretch lg:min-h-[540px] lg:grid-cols-[1.05fr_1fr]">
        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Provjereni majstori širom Crne Gore
          </div>

          <h1 className="max-w-xl text-3xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Pronađite
            <span className="block text-slate-900">majstora u blizini</span>
            <span className="block text-blue-600">za nekoliko minuta</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Platforma za provjerene majstore, brze ponude i jednostavno pronalaženje usluga za dom u cijeloj Crnoj Gori.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/request/create"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Objavi zahtjev
            </Link>
            <Link
              href="/register?type=majstor"
              className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-6 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Postani majstor
            </Link>
          </div>

          <HeroSearch />

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Verifikovani majstori
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Star className="h-5 w-5 text-amber-500" />
              4.8 od korisnika
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <MapPin className="h-5 w-5 text-blue-600" />
              Lokalno za Crnu Goru
            </div>
          </div>
        </div>
        <div className="relative min-h-[280px] lg:min-h-full" aria-hidden />
      </div>
    </section>
  );
}
