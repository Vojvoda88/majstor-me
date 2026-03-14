import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Hero } from "@/components/home-page/Hero";
import { FloatingStatsCard } from "@/components/home-page/FloatingStatsCard";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { ReviewCardsSection } from "@/components/home-page/ReviewCardsSection";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { FAQ } from "@/components/home-page/FAQ";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

export default function HomePage() {
  const orgJson = organizationJsonLd();
  const faqJson = faqPageJsonLd(FAQ_ITEMS);
  return (
    <main className="min-h-screen bg-[#FAFBFC] pb-28 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <PremiumMobileHeader />
      <div className="pt-16">
        <Hero />
        <FloatingStatsCard />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <CategoriesGrid />
        <ReviewCardsSection />
        <HowItWorks />
        <FAQ />
        <CTAForMasters />
      </div>

      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
    </main>
  );
}
