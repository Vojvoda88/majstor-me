import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CITY_SLUGS, cityLocative } from "@/lib/slugs";
import { getPublicHandymenList } from "@/lib/handymen-listing";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const revalidate = 3600;
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { buildPublicListingPageJsonLd } from "@/lib/json-ld";
import { gradMetaDescription, gradMetaTitle } from "@/lib/seo-landing-copy";
import { getSiteUrl } from "@/lib/site-url";
import { GradPageContent } from "./grad-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = CITY_SLUGS[slug];
  if (!name) {
    return {
      title: "Grad",
      description: "Pregled majstora po gradovima u Crnoj Gori.",
    };
  }
  const nameLocative = cityLocative(name);
  const base = getSiteUrl();
  const title = gradMetaTitle(nameLocative);
  const description = gradMetaDescription(nameLocative, name);

  const twTitle = `${title} | BrziMajstor.ME`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/grad/${slug}` },
    openGraph: {
      title: twTitle,
      description,
      url: `${base}/grad/${slug}`,
      siteName: "BrziMajstor.ME",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: twTitle,
      description,
    },
  };
}

export default async function GradPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CITY_SLUGS[slug];
  if (!name) notFound();

  const cityImage = HOMEPAGE_CITIES.find((c) => c.slug === slug)?.image;

  let initialListing = null as Awaited<ReturnType<typeof getPublicHandymenList>> | null;
  try {
    initialListing = await getPublicHandymenList({
      city: name,
      sortBy: "rating",
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  } catch {
    initialListing = null;
  }

  const base = getSiteUrl().replace(/\/$/, "");
  const nameLocative = cityLocative(name);
  const canonical = `${base}/grad/${slug}`;
  const pageDescription = gradMetaDescription(nameLocative, name);
  const gradJsonLd = buildPublicListingPageJsonLd({
    canonicalUrl: canonical,
    pageTitle: gradMetaTitle(nameLocative),
    description: pageDescription,
    breadcrumbs: [
      { name: "Početna", itemUrl: base },
      { name: name, itemUrl: canonical },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(gradJsonLd) }} />
      <GradPageContent
        cityName={name}
        slug={slug}
        cityImage={cityImage}
        initialListing={initialListing}
      />
    </>
  );
}
