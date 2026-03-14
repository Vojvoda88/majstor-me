import { notFound } from "next/navigation";
import { CITY_SLUGS } from "@/lib/slugs";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { GradPageContent } from "./grad-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CITY_SLUGS[slug];
  if (!name) return { title: "Grad | Majstor.me" };
  return {
    title: `Majstori ${name} | Majstor.me`,
    description: `Pronađite majstore u ${name}. Vodoinstalater, električar, klima servis i više.`,
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
