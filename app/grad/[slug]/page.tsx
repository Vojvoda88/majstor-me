import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CITY_SLUGS, cityLocative } from "@/lib/slugs";

export const revalidate = 3600;
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
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
  const title = `Majstori u ${nameLocative}`;
  const description = `Pronađite provjerene majstore u ${nameLocative} – vodoinstalater, električar, klima servis i druge usluge u ${name}. Pregledajte ponude ili objavite besplatan zahtjev.`;

  return {
    title,
    description,
    alternates: { canonical: `${base}/grad/${slug}` },
    openGraph: {
      title: `${title} | BrziMajstor.ME`,
      description,
      url: `${base}/grad/${slug}`,
      siteName: "BrziMajstor.ME",
      type: "website",
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

  return (
    <GradPageContent
      cityName={name}
      slug={slug}
      cityImage={cityImage}
    />
  );
}
