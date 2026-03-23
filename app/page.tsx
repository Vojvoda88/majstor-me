import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { getSiteUrl } from "@/lib/site-url";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Hero } from "@/components/home-page/Hero";
import { StatsStrip } from "@/components/home-page/StatsStrip";
import { WhyMajstorSection } from "@/components/home-page/WhyMajstorSection";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { HowItWorksForUsers, HowItWorksForHandymen } from "@/components/home-page/HowItWorks";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { SeoLandingLinks } from "@/components/home-page/SeoLandingLinks";
import { buildHomeJsonLdGraph } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

const siteUrl = getSiteUrl();

const homeDescription =
  "Povezivanje korisnika sa majstorima u Crnoj Gori. Objavite zahtjev besplatno — javljaju se majstori kojima posao odgovara; ponude i ocjene vidite uz svoj zahtjev kada stignu.";

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

const ReviewCardsSection = nextDynamic(
  () => import("@/components/home-page/ReviewCardsSection").then((m) => m.ReviewCardsSection),
  { loading: () => <div className="min-h-[260px] animate-pulse rounded-2xl bg-slate-100 md:min-h-[320px]" /> }
);

export default function HomePage() {
  const structuredData = buildHomeJsonLdGraph(FAQ_ITEMS);
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden pb-8 md:pb-16 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(29,78,216,0.06),transparent_55%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicHeader />
      <div className="pt-2 md:pt-8">
        <Hero />
        <StatsStrip />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 md:px-6 md:py-16">
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <HowItWorksForUsers />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
          <HowItWorksForHandymen />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <CTAForMasters />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.14s", animationFillMode: "both" }}>
          <CategoriesGrid />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
          <ReviewCardsSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.22s", animationFillMode: "both" }}>
          <WhyMajstorSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.26s", animationFillMode: "both" }}>
          <FAQ />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.28s", animationFillMode: "both" }}>
          <SeoLandingLinks />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
