import { HomeHeader } from "@/components/home-page/home-header";
import { Hero } from "@/components/home-page/Hero";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { CitiesGrid } from "@/components/home-page/CitiesGrid";
import { TopMasters } from "@/components/home-page/TopMasters";
import { TrustSection } from "@/components/home-page/TrustSection";
import { Testimonials } from "@/components/home-page/Testimonials";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { FAQ } from "@/components/home-page/FAQ";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <HomeHeader />
        <Hero />
        <HowItWorks />
        <CategoriesGrid />
        <CitiesGrid />
        <TopMasters />
        <TrustSection />
        <Testimonials />
        <CTAForMasters />
        <FAQ />
      </div>
    </main>
  );
}
