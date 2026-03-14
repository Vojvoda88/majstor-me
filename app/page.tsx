import { PremiumMobileHeader } from "@/components/layout/PremiumMobileHeader";
import { Hero } from "@/components/home-page/Hero";
import { StickyBottomCTA } from "@/components/layout/StickyBottomCTA";
import { HomeStatsSection } from "@/components/home-page/HomeStatsSection";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { TopMasters } from "@/components/home-page/TopMasters";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { FAQ } from "@/components/home-page/FAQ";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

export default function HomePage() {
  const orgJson = organizationJsonLd();
  const faqJson = faqPageJsonLd(FAQ_ITEMS);
  return (
    <main className="min-h-screen bg-[#F4F7FB] pb-28 text-[#0F172A] md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <PremiumMobileHeader />
      <Hero />
      <HomeStatsSection />
      <CategoriesGrid />
      <TopMasters />
      <HowItWorks />
      <FAQ />
      <CTAForMasters />
      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
    </main>
  );
}
