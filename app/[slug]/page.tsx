import { notFound } from "next/navigation";
import { Suspense } from "react";
import { parseCategoryCitySlug, cityLocative } from "@/lib/slugs";
import { getSiteUrl } from "@/lib/site-url";
import { SeoLandingContent } from "./seo-landing-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseCategoryCitySlug(slug);
  if (!parsed) return { title: { absolute: "BrziMajstor.ME" } };
  const base = getSiteUrl();
  const cityLoc = cityLocative(parsed.cityDisplayName);
  const title = `${parsed.categoryDisplayName} ${parsed.cityDisplayName}`;
  const description = `Pronađite ${parsed.categoryDisplayName.toLowerCase()}e u ${cityLoc}. Provjereni majstori, brze ponude.`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/${slug}` },
    openGraph: {
      title: `${title} | BrziMajstor.ME`,
      description,
      url: `${base}/${slug}`,
      siteName: "BrziMajstor.ME",
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
