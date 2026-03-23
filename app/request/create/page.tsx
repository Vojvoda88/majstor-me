import type { Metadata } from "next";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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

type CreateRequestSearchParams = {
  category?: string;
  city?: string;
};

export default function CreateRequestPage(props: { searchParams?: CreateRequestSearchParams }) {
  const params = props.searchParams ?? {};

  return (
    <div className="min-h-screen bg-brand-page pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] pt-16 md:pb-10 md:pt-20">
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

        <CreateRequestForm
          initialCategory={params.category}
          initialCity={params.city}
        />
      </div>
    </div>
  );
}
