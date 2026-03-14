import { HomeHeader } from "@/components/home-page/home-header";
import { Hero } from "@/components/home-page/Hero";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { CitiesGrid } from "@/components/home-page/CitiesGrid";
import { TopMasters } from "@/components/home-page/TopMasters";
import { PlatformStatsSection } from "@/components/home-page/PlatformStatsSection";
import { TrustSection } from "@/components/home-page/TrustSection";
import { Testimonials } from "@/components/home-page/Testimonials";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { FAQ } from "@/components/home-page/FAQ";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";

export default function HomePage() {
  const orgJson = organizationJsonLd();
  const faqJson = faqPageJsonLd(FAQ_ITEMS);
  return (
    <main className="min-h-screen bg-[#F6F8FB] text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <HomeHeader />
        <Hero />
        <HowItWorks />
        <CategoriesGrid />
        <CitiesGrid />
        <PlatformStatsSection />
        <TopMasters />
        <TrustSection />
        <Testimonials />
        <CTAForMasters />
        <FAQ />
      </div>
    </main>
  );
}
