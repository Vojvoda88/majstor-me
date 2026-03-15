import { notFound } from "next/navigation";
import { CITY_SLUGS } from "@/lib/slugs";

export const revalidate = 3600;
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { getSiteUrl } from "@/lib/site-url";
import { GradPageContent } from "./grad-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CITY_SLUGS[slug];
  if (!name) return { title: "Grad | Majstor.me" };
  const base = getSiteUrl();
  return {
    title: `Majstori ${name} | Majstor.me`,
    description: `Pronađite majstore u ${name}. Vodoinstalater, električar, klima servis i više.`,
    alternates: { canonical: `${base}/grad/${slug}` },
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
