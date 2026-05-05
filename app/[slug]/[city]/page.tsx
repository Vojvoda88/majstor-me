import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/categories";
import type { SeoCombinedParsed } from "@/lib/seo-landing-copy";
import { getPublicHandymenList } from "@/lib/handymen-listing";
import { getPrioritySeoLandingContent } from "@/lib/seo-landing-priority-copy";
import {
  buildSeoLandingJsonLd,
  buildSeoLandingDescription,
  buildSeoLandingTitle,
  buildSeoServiceCityCanonical,
} from "@/lib/seo-landing-metadata";
import {
  getProgrammaticServiceCityParams,
  isValidProgrammaticServiceCity,
  toLegacyServiceCitySlug,
} from "@/lib/seo-programmatic-config";
import { getSiteUrl } from "@/lib/site-url";
import { CITY_SLUGS } from "@/lib/slugs";
import { SEO_OG_IMAGE_PATH } from "@/lib/seo-brand";
import { SeoLandingContent } from "../../(seo)/[slug]/seo-landing-content";

export const revalidate = 3600;

export function generateStaticParams() {
  return getProgrammaticServiceCityParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  if (isValidProgrammaticServiceCity(slug, city).ok === false) notFound();
  const cat = getCategoryBySlug(slug)!;
  const cityName = CITY_SLUGS[city]!;
  const base = getSiteUrl();
  const legacySlug = toLegacyServiceCitySlug(slug, city);
  const parsed: SeoCombinedParsed = {
    categorySlug: slug,
    citySlug: city,
    categoryDisplayName: cat.displayName,
    cityDisplayName: cityName,
    internalCategory: cat.internalCategory,
  };
  const canonical = buildSeoServiceCityCanonical(base, slug, city);
  const priority = getPrioritySeoLandingContent(legacySlug);
  const title = priority?.metaTitle ?? buildSeoLandingTitle(parsed);
  const description = priority?.metaDescription ?? buildSeoLandingDescription(parsed);
  const tw = `${title} | BrziMajstor.ME`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: tw,
      description,
      url: canonical,
      siteName: "BrziMajstor.ME",
      type: "website",
      images: [SEO_OG_IMAGE_PATH],
    },
    twitter: {
      card: "summary_large_image",
      title: tw,
      description,
      images: [SEO_OG_IMAGE_PATH],
    },
  };
}

export default async function ServiceCityPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  if (isValidProgrammaticServiceCity(slug, city).ok === false) notFound();

  const cat = getCategoryBySlug(slug)!;
  const cityName = CITY_SLUGS[city]!;
  const legacySlug = toLegacyServiceCitySlug(slug, city);
  const base = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = buildSeoServiceCityCanonical(base, slug, city);

  const parsed: SeoCombinedParsed = {
    categorySlug: slug,
    citySlug: city,
    categoryDisplayName: cat.displayName,
    cityDisplayName: cityName,
    internalCategory: cat.internalCategory,
  };

  const priority = getPrioritySeoLandingContent(legacySlug);
  const title = priority?.metaTitle ?? buildSeoLandingTitle(parsed);
  const description = priority?.metaDescription ?? buildSeoLandingDescription(parsed);

  const jsonLd = buildSeoLandingJsonLd({
    canonicalUrl,
    siteUrl: base,
    title,
    description,
    parsed,
  });

  const initialListing = await getPublicHandymenList({
    category: parsed.internalCategory,
    city: parsed.cityDisplayName,
    sortBy: "rating",
    page: 1,
  }).catch(() => null);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoLandingContent
        slug={legacySlug}
        displayName={parsed.categoryDisplayName}
        internalCategory={parsed.internalCategory}
        cityName={parsed.cityDisplayName}
        citySlug={parsed.citySlug}
        categorySlug={parsed.categorySlug}
        initialListing={initialListing}
      />
    </>
  );
}
