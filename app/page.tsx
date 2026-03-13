import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { FeaturedHandymenSection } from "@/components/featured-handymen-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { CategoriesSection } from "@/components/categories-section";
import { CitiesSection } from "@/components/cities-section";
import { TrustSection } from "@/components/trust-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <FeaturedHandymenSection />
      <CategoriesSection />
      <CitiesSection />
      <TrustSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
