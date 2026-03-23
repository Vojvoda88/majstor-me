import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { parseCategoryCitySlug } from "@/lib/slugs";
import { getSiteUrl } from "@/lib/site-url";
import { getSeoLandingStaticParams } from "@/lib/seo-landing-config";
import {
  buildSeoCanonical,
  buildSeoLandingDescription,
  buildSeoLandingJsonLd,
  buildSeoLandingTitle,
} from "@/lib/seo-landing-metadata";
import { SeoLandingContent } from "./seo-landing-content";

export const revalidate = 3600;

/** Pregenerisane stranice za glavne gradove × kategorije (7×6 = 42) */
export function generateStaticParams() {
  return getSeoLandingStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCategoryCitySlug(slug);
  if (!parsed) {
    return { title: { absolute: "BrziMajstor.ME" } };
  }
  const base = getSiteUrl();
  const canonical = buildSeoCanonical(base, slug);
  const title = buildSeoLandingTitle(parsed);
  const description = buildSeoLandingDescription(parsed);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | BrziMajstor.ME`,
      description,
      url: canonical,
      siteName: "BrziMajstor.ME",
      type: "website",
    },
  };
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseCategoryCitySlug(slug);
  if (!parsed) notFound();

  const base = getSiteUrl();
  const canonicalUrl = buildSeoCanonical(base, slug);
  const title = buildSeoLandingTitle(parsed);
  const description = buildSeoLandingDescription(parsed);
  const jsonLd = buildSeoLandingJsonLd({
    canonicalUrl,
    siteUrl: base.replace(/\/$/, ""),
    title,
    description,
    parsed,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-100 p-8">Učitavanje...</div>}>
        <SeoLandingContent
          displayName={parsed.categoryDisplayName}
          internalCategory={parsed.internalCategory}
          cityName={parsed.cityDisplayName}
          citySlug={parsed.citySlug}
          categorySlug={parsed.categorySlug}
        />
      </Suspense>
    </>
  );
}
