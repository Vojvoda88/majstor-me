import Link from "next/link";
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

        {/* CTA - Objavi zahtjev */}
        <section className="pb-16">
          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-10 text-white shadow-[0_16px_50px_rgba(15,23,42,0.18)] sm:px-10 lg:px-14 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Spremni da krenete?
                </p>
                <h2 className="max-w-2xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  Objavi zahtjev i pronađi pravog majstora bez gubljenja vremena
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Brže do ponuda, više povjerenja i bolji pregled majstora na
                  jednom mjestu.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  href="/request/create"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white transition hover:bg-blue-700"
                >
                  Objavi zahtjev
                </Link>
                <Link
                  href="/register?type=majstor"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Postani majstor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
