import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getSiteUrl } from "@/lib/site-url";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Hero } from "@/components/home-page/Hero";
import { WhyMajstorSection } from "@/components/home-page/WhyMajstorSection";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { HowItWorksForUsers, HowItWorksForHandymen } from "@/components/home-page/HowItWorks";
import { SeoLandingLinks } from "@/components/home-page/SeoLandingLinks";
import { buildHomeJsonLdGraph } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

const siteUrl = getSiteUrl();

const homeDescription =
  "Treba vam majstor danas? Zatražite majstora za manje od 1 minuta — zainteresovani i dostupni majstori javljaju vam se direktno. Crna Gora.";

/** Naslov koristi template iz root layout-a: „… | BrziMajstor.ME“ */
export const metadata: Metadata = {
  title: "Marketplace majstora u Crnoj Gori",
  description: homeDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Marketplace majstora u Crnoj Gori | BrziMajstor.ME",
    description: homeDescription,
    url: siteUrl,
  },
  twitter: {
    title: "Marketplace majstora u Crnoj Gori | BrziMajstor.ME",
    description: homeDescription,
  },
};

export const revalidate = 60;

const FAQ = nextDynamic(
  () => import("@/components/home-page/FAQ").then((m) => m.FAQ),
  { loading: () => <div className="min-h-[220px] animate-pulse rounded-2xl bg-slate-100 md:min-h-[280px]" /> }
);

export default function HomePage() {
  const structuredData = buildHomeJsonLdGraph(FAQ_ITEMS);
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden pb-8 md:pb-16 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(29,78,216,0.06),transparent_55%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicHeader />
      <div className="pt-0 md:pt-8">
        <Hero />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-5 md:px-6 md:pb-20 md:pt-12">
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <HowItWorksForUsers />
        </div>
        <div className="relative animate-fade-up pt-3 md:pt-5" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/85 to-transparent" />
          <HowItWorksForHandymen />
        </div>
        <div className="relative animate-fade-up pt-3 md:pt-5" style={{ animationDelay: "0.14s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/85 to-transparent" />
          <CategoriesGrid />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/75 to-transparent" />
          <WhyMajstorSection />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.22s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/75 to-transparent" />
          <FAQ />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.26s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
          <SeoLandingLinks />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
