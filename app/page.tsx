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
    <main className="relative min-h-screen bg-[#FAFBFC] pb-28 md:pb-16 before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,99,235,0.08),transparent)] before:pointer-events-none isolate">
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
        <div className="animate-fade-up">
          <CategoriesGrid />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <ReviewCardsSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <HowItWorks />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.25s", animationFillMode: "both" }}>
          <FAQ />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
          <CTAForMasters />
        </div>
      </div>

      <StickyBottomCTA href="/request/create" label="Objavi zahtjev" />
    </main>
  );
}
