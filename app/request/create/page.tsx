import type { Metadata } from "next";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Pošalji zahtjev majstoru",
  description:
    "Objavite besplatan zahtjev za majstora u Crnoj Gori – vodoinstalater, električar, klima servis i druge usluge. Zainteresovani majstori šalju ponude nakon što zahtjev bude odobren.",
  alternates: {
    canonical: `${baseUrl}/request/create`,
  },
  openGraph: {
    title: "Pošalji zahtjev majstoru | BrziMajstor.ME",
    description:
      "Jednim zahtjevom javljaju se majstori kojima posao odgovara. Objava je besplatna; ponude pregledate uz zahtjev kad stignu.",
    url: `${baseUrl}/request/create`,
    siteName: "BrziMajstor.ME",
    type: "website",
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
    <div className="min-h-screen bg-brand-page pb-28 pt-16 md:pb-10 md:pt-20">
      <PremiumMobileHeader />
      <div className="mx-auto max-w-[430px] px-4 py-8 md:max-w-2xl md:py-10">
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
