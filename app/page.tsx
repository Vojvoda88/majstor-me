import nextDynamic from "next/dynamic";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Hero } from "@/components/home-page/Hero";
import { FloatingStatsCard } from "@/components/home-page/FloatingStatsCard";
import { WhyMajstorSection } from "@/components/home-page/WhyMajstorSection";
import { CategoriesGrid } from "@/components/home-page/CategoriesGrid";
import { HowItWorks } from "@/components/home-page/HowItWorks";
import { CTAForMasters } from "@/components/home-page/CTAForMasters";
import { organizationJsonLd, faqPageJsonLd } from "@/lib/json-ld";
import { FAQ_ITEMS } from "@/lib/faq-data";
import { getPlatformStats, getTopHandymenForHome } from "@/lib/home-data";

export const revalidate = 60;

const FAQ = nextDynamic(
  () => import("@/components/home-page/FAQ").then((m) => m.FAQ),
  { loading: () => <div className="min-h-[280px] animate-pulse rounded-2xl bg-slate-100" /> }
);

const StickyBottomCTA = nextDynamic(
  () => import("@/components/layout/StickyBottomCTA").then((m) => m.StickyBottomCTA),
  { loading: () => <div className="h-0" /> }
);

const ReviewCardsSection = nextDynamic(
  () => import("@/components/home-page/ReviewCardsSection").then((m) => m.ReviewCardsSection),
  { loading: () => <div className="min-h-[320px] animate-pulse rounded-2xl bg-slate-100" /> }
);

async function getHomeData() {
  try {
    const [stats, handymen] = await Promise.all([
      getPlatformStats(),
      getTopHandymenForHome(3),
    ]);
    return { stats, handymen };
  } catch {
    return { stats: null, handymen: [] };
  }
}

export default async function HomePage() {
  const { stats, handymen } = await getHomeData();
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
      <PublicHeader />
      <div className="pt-16">
        <Hero />
        <FloatingStatsCard initialStats={stats} />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <WhyMajstorSection />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <CategoriesGrid />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <ReviewCardsSection initialHandymen={handymen} />
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
