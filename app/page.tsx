import { HomeHeader } from "@/components/home-page/home-header";
import { Hero } from "@/components/home-page/Hero";
import { MobileStickyCTA } from "@/components/home-page/MobileStickyCTA";
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
    <main className="min-h-screen bg-[#F4F7FB] pb-28 text-[#0F172A] md:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
      <HomeHeader />
      <Hero />
      <PlatformStatsSection />
      <CategoriesGrid />
      <TopMasters />
      <section id="kako-radi" className="hidden md:block">
        <HowItWorks />
      </section>
      <div className="hidden md:block">
        <CitiesGrid />
        <TrustSection />
        <Testimonials />
        <CTAForMasters />
        <FAQ />
      </div>
      <MobileStickyCTA />
    </main>
  );
}
