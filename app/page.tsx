import nextDynamic from "next/dynamic";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Hero } from "@/components/home-page/Hero";
import { StatsStrip } from "@/components/home-page/StatsStrip";
import { WhyMajstorSection } from "@/components/home-page/WhyMajstorSection";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

export const revalidate = 60;

const FAQ = nextDynamic(
  () => import("@/components/home-page/FAQ").then((m) => m.FAQ),
  { loading: () => <div className="min-h-[280px] animate-pulse rounded-2xl bg-slate-100" /> }
);

const ReviewCardsSection = nextDynamic(
  () => import("@/components/home-page/ReviewCardsSection").then((m) => m.ReviewCardsSection),
  { loading: () => <div className="min-h-[320px] animate-pulse rounded-2xl bg-slate-100" /> }
);

export default function HomePage() {
  const orgJson = organizationJsonLd();
  const faqJson = faqPageJsonLd(FAQ_ITEMS);
  return (
    <main className="relative isolate min-h-screen pb-12 md:pb-16 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(29,78,216,0.06),transparent_55%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
      <PublicHeader />
      <div className="pt-4 md:pt-8">
        <Hero />
        <StatsStrip />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 md:px-6 md:py-20">
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <CategoriesGrid />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <HowItWorks />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <ReviewCardsSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <WhyMajstorSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
          <FAQ />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <CTAForMasters />
        </div>
      </div>
    </main>
  );
}
