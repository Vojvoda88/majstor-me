"use client";

import { useEffect, useState, type TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { HERO_IMAGE } from "@/lib/homepage-data";
import { useUiLanguage } from "@/lib/i18n/ui-language";
import { t } from "@/lib/i18n/messages";

export function Hero() {
  const locale = useUiLanguage();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [categorySlides, setCategorySlides] = useState<
    { slug: string; label: string; count: number }[]
  >([]);

  const trustItems = [
    { title: "70+", subtitle: "majstora i usluga" },
    { title: "Zatražite majstora", subtitle: "100% besplatno" },
    { title: "Objavi zahtjev", subtitle: "za manje od minut" },
  ];

  useEffect(() => {
    let cancelled = false;
    async function loadCategorySlides() {
      try {
        const res = await fetch("/api/stats/handymen-by-category");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items?: { slug: string; label: string; count: number }[];
        };
        if (cancelled) return;
        const normalized = (data.items ?? []).filter((item) => Number.isFinite(item.count));
        setCategorySlides(normalized);
        setActiveCategoryIndex(0);
      } catch {
        // Silent fallback — hero i dalje radi bez ovog bloka.
      }
    }
    loadCategorySlides();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (categorySlides.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveCategoryIndex((prev) => (prev + 1) % categorySlides.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [categorySlides.length]);

  const trustTitleClass = (title: string) =>
    title === "70+" ? "text-xl leading-none text-blue-700" : "text-[12px] leading-tight text-slate-800";

  const handleCategoryTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleCategoryTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX == null || categorySlides.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const diff = endX - touchStartX;
    const threshold = 40;
    if (Math.abs(diff) < threshold) {
      setTouchStartX(null);
      return;
    }
    if (diff < 0) {
      setActiveCategoryIndex((prev) => (prev + 1) % categorySlides.length);
    } else {
      setActiveCategoryIndex((prev) => (prev - 1 + categorySlides.length) % categorySlides.length);
    }
    setTouchStartX(null);
  };

  return (
    <section className="relative flex min-h-[min(88dvh,690px)] w-full items-center justify-center overflow-hidden rounded-b-[1.1rem] px-4 pb-12 pt-[max(4.5rem,env(safe-area-inset-top)+3.25rem)] text-white sm:px-5 md:min-h-[760px] md:rounded-b-[1.5rem] md:pb-20 md:pt-28">
      <Image
        src={HERO_IMAGE}
        alt={t(locale, "home.hero.imageAlt", "Majstor na poslu")}
        fill
        className="pointer-events-none object-cover object-[center_35%] md:object-[center_25%]"
        priority
        sizes="100vw"
      />
      {/* Jači kontrast da hero tekst bude čitljiv na mobilnom. */}
      <div className="pointer-events-none absolute inset-0 bg-black/40 md:bg-black/20" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy/96 via-brand-navy/84 to-brand-navy/92"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(245,158,11,0.12),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-auto relative z-10 w-full max-w-4xl text-center">
        <h1 className="font-display mb-4 text-[1.72rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2rem] md:mb-5 md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          Treba vam majstor?
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-100/95 sm:text-base md:mb-8 md:text-lg md:leading-relaxed">
          Objavite zahtjev — majstor vas pozove.
        </p>

        <div className="mx-auto mt-2 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4">
          <Link
            href="/request/create"
            className="inline-flex h-14 min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] px-6 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition hover:brightness-105 active:scale-[0.98] sm:px-8"
          >
            Zatraži majstora
          </Link>
          <Link
            href="/register?type=majstor"
            className="inline-flex h-14 min-h-[52px] w-full items-center justify-center rounded-2xl border-2 border-amber-300/90 bg-gradient-to-br from-amber-500/25 to-amber-600/15 px-6 text-base font-bold text-amber-50 shadow-lg shadow-amber-900/25 ring-1 ring-amber-200/30 backdrop-blur-md transition hover:from-amber-500/35 hover:to-amber-600/25 hover:text-white active:scale-[0.98] sm:px-8"
          >
            Nudite usluge? Registrujte se
          </Link>
        </div>

        <p className="mx-auto mt-3 text-sm text-slate-100/90">
          Imate profil?{" "}
          <Link href="/login" className="font-semibold text-white underline underline-offset-2 hover:text-blue-100">
            Prijavi se
          </Link>
        </p>

        {categorySlides.length > 0 ? (
          <div className="mx-auto mt-4 w-full max-w-3xl text-left sm:mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-200/90">
              Trenutno po kategorijama
            </p>

            <div
              className="overflow-hidden sm:hidden"
              onTouchStart={handleCategoryTouchStart}
              onTouchEnd={handleCategoryTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeCategoryIndex * 100}%)` }}
              >
                {categorySlides.map((item) => (
                  <div key={item.slug} className="w-full shrink-0 px-0.5">
                    <Link
                      href={`/category/${item.slug}`}
                      className="block rounded-2xl border border-violet-200/35 bg-gradient-to-br from-violet-500/16 to-slate-900/20 px-4 py-3 shadow-[0_0_24px_rgba(139,92,246,0.22)] backdrop-blur-sm transition hover:brightness-110 active:scale-[0.99]"
                    >
                      <p className="text-sm font-extrabold leading-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.32)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-100">
                        {item.count} majstor{item.count === 1 ? "" : "a"}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                {categorySlides.map((item, idx) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setActiveCategoryIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeCategoryIndex === idx ? "w-5 bg-white" : "w-2 bg-white/40"
                    }`}
                    aria-label={`Prikaži kategoriju ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="hidden gap-2.5 sm:grid sm:grid-cols-3 lg:grid-cols-5">
              {categorySlides.map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className="rounded-2xl border border-violet-200/35 bg-gradient-to-br from-violet-500/16 to-slate-900/20 px-3 py-3 shadow-[0_0_24px_rgba(139,92,246,0.22)] backdrop-blur-sm transition hover:brightness-110"
                >
                  <p className="text-sm font-extrabold leading-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.32)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-100">
                    {item.count} majstor{item.count === 1 ? "" : "a"}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-4 w-full max-w-3xl text-left sm:mt-5">
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/90 bg-white/90 px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.22)] backdrop-blur-sm"
              >
                <p
                  className={`font-extrabold drop-shadow-[0_0_6px_rgba(37,99,235,0.18)] ${trustTitleClass(item.title)}`}
                >
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-slate-700">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
