import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { GuestRequestReturnCard } from "@/components/request/guest-request-return-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { parseRequestCreateSearchParams } from "@/lib/request-create-query";
import { SEO_REQUEST_CREATE_DESCRIPTION } from "@/lib/seo-brand";
import { getSiteUrl } from "@/lib/site-url";
import { auth } from "@/lib/auth";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Zatraži majstora",
  description: SEO_REQUEST_CREATE_DESCRIPTION,
  alternates: {
    canonical: `${baseUrl}/request/create`,
  },
  openGraph: {
    title: "Zatraži majstora | BrziMajstor.ME",
    description: SEO_REQUEST_CREATE_DESCRIPTION,
    url: `${baseUrl}/request/create`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zatraži majstora | BrziMajstor.ME",
    description: SEO_REQUEST_CREATE_DESCRIPTION,
  },
};

export const dynamic = "force-dynamic";

/**
 * Next 15: `searchParams` je Promise; Next 14: običan objekat.
 * Oba slučaja: `await Promise.resolve(searchParams)` + normalizacija string | string[].
 */
export default async function CreateRequestPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  let initialCategory: string | undefined;
  let initialCity: string | undefined;

  try {
    const raw = await Promise.resolve(props.searchParams ?? {});
    const parsed = parseRequestCreateSearchParams(raw);
    initialCategory = parsed.initialCategory;
    initialCity = parsed.initialCity;
    console.info("[RequestCreateSSR]", {
      ok: true,
      hasCategory: Boolean(initialCategory),
      hasCity: Boolean(initialCity),
    });
  } catch (e) {
    console.error("[RequestCreateSSR] parse_failed", e);
  }

  return (
    <div className="min-h-screen bg-brand-page pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4rem+env(safe-area-inset-top,0px))] md:pb-10 md:pt-20">
      <PremiumMobileHeader />
      <div className="mx-auto max-w-[430px] px-4 py-6 md:max-w-2xl md:py-10">
        <Breadcrumbs
          items={[
            { label: "Početna", href: "/" },
            { label: "Novi zahtjev" },
          ]}
        />

        <header className="mb-6 md:mb-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-navy md:text-3xl">
            Zatraži majstora
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 md:text-base">
            Besplatno za vas. Opišite posao što jasnije — jedan zahtjev umjesto više poziva. Administrator prvo
            pregleda zahtjev, zatim se javljaju majstori kojima posao odgovara.
          </p>
        </header>
        {!session?.user?.id && (
          <div className="mb-5 rounded-[1.35rem] border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-4 shadow-[0_16px_38px_-28px_rgba(15,23,42,0.28)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Preporučeno</p>
            <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900">Otvorite nalog prije slanja (opciono)</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Nije obavezno, ali je lakše da kasnije pratite zahtjev, ponude i status na jednom mjestu.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#2563EB] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8]"
              >
                Registruj se
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Već imam nalog
              </Link>
            </div>
          </div>
        )}
        <GuestRequestReturnCard />

        <Suspense
          fallback={
            <div
              className="w-full animate-pulse overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-8 shadow-marketplace"
              aria-hidden
            >
              <div className="mb-4 h-6 w-48 rounded bg-slate-200" />
              <div className="h-32 rounded-lg bg-slate-100" />
            </div>
          }
        >
          <CreateRequestForm initialCategory={initialCategory} initialCity={initialCity} />
        </Suspense>
      </div>
    </div>
  );
}
