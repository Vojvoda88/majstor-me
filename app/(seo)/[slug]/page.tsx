import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { parseCategoryCitySlug, cityLocative } from "@/lib/slugs";
import { getSiteUrl } from "@/lib/site-url";
import { getSeoLandingStaticParams } from "@/lib/seo-landing-config";
import { SeoLandingContent } from "./seo-landing-content";

export const revalidate = 3600;

/** Pregenerisane stranice za glavne gradove × kategorije (brži TTFB, bolje za indeksiranje) */
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
  const cityLoc = cityLocative(parsed.cityDisplayName);
  const title = `${parsed.categoryDisplayName} u ${cityLoc}`;
  const description = `Pronađite ${parsed.categoryDisplayName.toLowerCase()} u ${cityLoc}. BrziMajstor.ME vam omogućava da brzo dobijete ponude od majstora.`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/${slug}` },
    openGraph: {
      title: `${title} | BrziMajstor.ME`,
      description,
      url: `${base}/${slug}`,
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

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-100 p-8">Učitavanje...</div>}>
      <SeoLandingContent
        displayName={parsed.categoryDisplayName}
        internalCategory={parsed.internalCategory}
        cityName={parsed.cityDisplayName}
        citySlug={parsed.citySlug}
      />
    </Suspense>
  );
}
