import type { Metadata } from "next";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, Star, Zap } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Pošalji zahtjev majstoru",
  description:
    "Objavite besplatan zahtjev za majstora u Crnoj Gori – vodoinstalater, električar, klima servis i druge usluge. Primite brze ponude od provjerenih majstora.",
  alternates: {
    canonical: `${baseUrl}/request/create`,
  },
  openGraph: {
    title: "Pošalji zahtjev majstoru | BrziMajstor.ME",
    description:
      "Jednim zahtjevom dobijate više ponuda od provjerenih majstora u Crnoj Gori. Objavite posao besplatno i izaberite ponudu koja vam najviše odgovara.",
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

        <header className="mb-8 md:mb-10">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Korak 1 od 1</p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-navy md:text-4xl">
            Opis posla za majstora
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            Napišite šta vam treba – vodoinstalater, električar, klima servis ili druga usluga. Vaš zahtjev je
            besplatan, a ponude stižu direktno od provjerenih majstora.
          </p>
          <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 text-xs text-slate-700 shadow-marketplace-sm md:grid-cols-3 md:gap-4 md:p-5 md:text-sm">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-lg bg-emerald-50 p-1.5 text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <p>
                <span className="font-semibold">Provjereni majstori</span>
                <br />
                Profili sa ocjenama i recenzijama korisnika.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-lg bg-sky-50 p-1.5 text-sky-700">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <p>
                <span className="font-semibold">Brze ponude</span>
                <br />
                Ponude stižu u kratkom roku nakon objave.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-lg bg-amber-50 p-1.5 text-amber-700">
                <Star className="h-3.5 w-3.5" />
              </span>
              <p>
                <span className="font-semibold">Bez obaveze</span>
                <br />
                Pregledajte ponude i izaberite majstora koji vam najviše odgovara.
              </p>
            </div>
          </div>
        </header>

        <CreateRequestForm
          initialCategory={params.category}
          initialCity={params.city}
        />
      </div>
    </div>
  );
}
