import type { Metadata } from "next";
import { CreateRequestForm } from "@/components/forms/create-request-form";
import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Novi zahtjev | Majstor.me",
  description: "Objavite zahtjev za majstora – vodoinstalater, električar, klima servis i druge usluge u Crnoj Gori.",
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
        <CreateRequestForm
          initialCategory={params.category}
          initialCity={params.city}
        />
      </div>
    </div>
  );
}
