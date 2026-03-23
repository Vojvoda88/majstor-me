import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/categories";
import { getPublicHandymenList } from "@/lib/handymen-listing";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const revalidate = 3600;
import { getSiteUrl } from "@/lib/site-url";
import { CategoryPageContent } from "./category-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategoryBySlug(slug);
  if (!config) {
    return {
      title: "Kategorija",
      description: "Pregled kategorija majstora na BrziMajstor.ME platformi.",
    };
  }
  const base = getSiteUrl();
  const title = `${config.displayName} majstori u Crnoj Gori`;
  const description = `Pregled majstora za kategoriju ${config.displayName.toLowerCase()} širom Crne Gore. Pronađite provjerenog majstora ili objavite besplatan zahtjev i dobijte ponude.`;

  const ogTitle = `${title} | BrziMajstor.ME`;
  return {
    title,
    description,
    alternates: { canonical: `${base}/category/${slug}` },
    openGraph: {
      title: ogTitle,
      description,
      url: `${base}/category/${slug}`,
      siteName: "BrziMajstor.ME",
      type: "website",
    },
  };
}

function parseCityParam(city: string | string[] | undefined): string {
  if (typeof city === "string") return city;
  if (Array.isArray(city) && city[0]) return city[0];
  return "";
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string | string[] }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialCity = parseCityParam(sp.city);

  const config = getCategoryBySlug(slug);
  if (!config) notFound();

  let initialListing =
    null as Awaited<ReturnType<typeof getPublicHandymenList>> | null;
  try {
    initialListing = await getPublicHandymenList({
      category: config.internalCategory,
      city: initialCity || undefined,
      sortBy: "rating",
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  } catch {
    initialListing = null;
  }

  return (
    <CategoryPageContent
      displayName={config.displayName}
      internalCategory={config.internalCategory}
      slug={slug}
      initialCity={initialCity}
      initialListing={initialListing}
    />
  );
}
