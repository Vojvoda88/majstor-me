import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Hero } from "@/components/home-page/Hero";
import { FloatingStatsCard } from "@/components/home-page/FloatingStatsCard";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { AboutSection } from "@/components/home-page/AboutSection";
import { ReviewCardsSection } from "@/components/home-page/ReviewCardsSection";
import { RightInfoPanel } from "@/components/home-page/RightInfoPanel";
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
    <main className="min-h-screen bg-[#F3F4F6] pb-28 md:pb-10">
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

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-[1fr_320px] lg:gap-12">
          <div>
            <CategoriesGrid />
            <AboutSection />
            <ReviewCardsSection />
            <HowItWorks />
            <FAQ />
            <CTAForMasters />
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <RightInfoPanel />
            </div>
          </aside>
        </div>
      </div>

      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
    </main>
  );
}
