import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/site-url";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Hero } from "@/components/home-page/Hero";
import { WhyMajstorSection } from "@/components/home-page/WhyMajstorSection";
import { FeaturedHandymenSection } from "@/components/home-page/FeaturedHandymenSection";
import { getPublicHandymenList } from "@/lib/handymen-listing";
import { HowItWorksForUsers, HowItWorksForHandymen } from "@/components/home-page/HowItWorks";
import { SeoLandingLinks } from "@/components/home-page/SeoLandingLinks";
import { buildHomeJsonLdGraph } from "@/lib/json-ld";
import { getActiveFaqItems } from "@/lib/content/faq";
import {
  SEO_HOME_DESCRIPTION,
  SEO_HOME_TITLE,
  SEO_OG_IMAGE,
  SEO_OG_IMAGE_PATH,
} from "@/lib/seo-brand";
import { buildAlternates, getLocaleFromHeaderValue, LOCALE_HEADER, localizedPath } from "@/lib/i18n/seo";

const siteUrl = getSiteUrl();

/** Naslov koristi template iz root layout-a: „… | BrziMajstor.ME“ (ovdje samo segment prije |) */
export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocaleFromHeaderValue(headers().get(LOCALE_HEADER));
  return {
    title: SEO_HOME_TITLE,
    description: SEO_HOME_DESCRIPTION,
    alternates: buildAlternates(siteUrl, "/", locale),
    openGraph: {
      title: `${SEO_HOME_TITLE} | BrziMajstor.ME`,
      description: SEO_HOME_DESCRIPTION,
      url: `${siteUrl.replace(/\/$/, "")}${localizedPath("/", locale)}`,
      images: [SEO_OG_IMAGE],
    },
    twitter: {
      title: `${SEO_HOME_TITLE} | BrziMajstor.ME`,
      description: SEO_HOME_DESCRIPTION,
      images: [SEO_OG_IMAGE_PATH],
    },
  };
}

export const revalidate = 60;

const HomeFaqBlock = nextDynamic(
  () => import("@/components/home-page/HomeFaqBlock").then((m) => m.HomeFaqBlock),
  { loading: () => <div className="min-h-[220px] animate-pulse rounded-2xl bg-slate-100 md:min-h-[280px]" /> }
);

export default async function HomePage() {
  const faqItems = await getActiveFaqItems();
  const featuredPage = await getPublicHandymenList({
    sortBy: "homepage",
    page: 1,
    limit: 6,
    category: null,
    city: null,
  });
  const structuredData = buildHomeJsonLdGraph(faqItems);
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden pb-8 md:pb-16 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(29,78,216,0.06),transparent_55%)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicHeader />
      <div className="pt-0 md:pt-8">
        <Hero />
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-5 md:px-6 md:pb-20 md:pt-12">
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
          <HowItWorksForUsers />
        </div>
        <div className="relative animate-fade-up pt-3 md:pt-5" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/85 to-transparent" />
          <HowItWorksForHandymen />
        </div>
        <div className="relative animate-fade-up pt-3 md:pt-5" style={{ animationDelay: "0.14s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/85 to-transparent" />
          <FeaturedHandymenSection initialItems={featuredPage.items} total={featuredPage.total} pageSize={6} />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.18s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/75 to-transparent" />
          <WhyMajstorSection />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.22s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/75 to-transparent" />
          <HomeFaqBlock items={faqItems} />
        </div>
        <div className="relative animate-fade-up pt-2 md:pt-4" style={{ animationDelay: "0.26s", animationFillMode: "both" }}>
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
          <SeoLandingLinks />
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
