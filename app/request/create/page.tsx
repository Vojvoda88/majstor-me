import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { GuestRequestReturnCard } from "@/components/request/guest-request-return-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { parseRequestCreateSearchParams } from "@/lib/request-create-query";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Besplatan zahtjev majstoru",
  description:
    "Objavite zahtjev besplatno — birajte grad i opis posla. Ponude stižu nakon odobrenja; birate šta vam odgovara.",
  alternates: {
    canonical: `${baseUrl}/request/create`,
  },
  openGraph: {
    title: "Besplatan zahtjev majstoru | BrziMajstor.ME",
    description:
      "Jedan zahtjev, više majstora može da odgovori. Objava je besplatna za korisnike.",
    url: `${baseUrl}/request/create`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Besplatan zahtjev majstoru | BrziMajstor.ME",
    description:
      "Objavite zahtjev besplatno — birajte grad i opis. Ponude nakon odobrenja.",
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
            Objavi zahtjev
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600 md:text-base">
            Objava je besplatna. Opišite posao što jasnije — jedan zahtjev umjesto više poziva. Administrator prvo
            pregleda zahtjev, zatim zainteresovani majstori mogu poslati ponude.
          </p>
        </header>
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
