import type { Metadata } from "next";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, Star, Zap } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Objavite novi zahtjev | Majstor.me",
  description:
    "Objavite besplatan zahtjev za majstora u Crnoj Gori – vodoinstalater, električar, klima servis i druge usluge. Primite brze ponude od provjerenih majstora.",
  alternates: {
    canonical: `${baseUrl}/request/create`,
  },
  openGraph: {
    title: "Objavite novi zahtjev | Majstor.me",
    description:
      "Jednim zahtjevom dobijate više ponuda od provjerenih majstora u Crnoj Gori. Objavite posao besplatno i izaberite ponudu koja vam najviše odgovara.",
    url: `${baseUrl}/request/create`,
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
    <div className="min-h-screen bg-[#F3F4F6] pb-28 pt-16 md:pb-10 md:pt-20">
      <PremiumMobileHeader />
      <div className="mx-auto max-w-[430px] px-4 py-6 md:max-w-2xl md:py-8">
        <Breadcrumbs
          items={[
            { label: "Početna", href: "/" },
            { label: "Novi zahtjev" },
          ]}
        />

        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Opis posla za majstora
          </h1>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            Napišite šta vam treba – vodoinstalater, električar, klima servis ili druga usluga. Vaš zahtjev je
            besplatan, a ponude stižu direktno od provjerenih majstora.
          </p>
          <div className="mt-4 grid gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-700 md:grid-cols-3 md:gap-4 md:p-4 md:text-sm">
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
