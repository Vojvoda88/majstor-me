import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { SEO_LANDING_CITIES } from "@/lib/seo-landing-config";

/** Gradovi iz SEO FAZE 3 (kombinovane rute u generateStaticParams) — viši prioritet u sitemapu */
const SEO_CORE_CITY_SLUGS = new Set<string>(SEO_LANDING_CITIES);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/request/create`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/instaliraj`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = HOMEPAGE_CITIES.map((c) => ({
    url: `${base}/grad/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  /**
   * Kombinovane rute: jedan prolaz kategorija × gradova (homepage lista).
   * Viši prioritet za gradove koji su u core SEO setu (7 gradova × kategorije).
   */
  const seoCombinedPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.flatMap((cat) =>
    HOMEPAGE_CITIES.map((city) => ({
      url: `${base}/${cat.slug}-${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: SEO_CORE_CITY_SLUGS.has(city.slug) ? 0.84 : 0.7,
    }))
  );

  let handymanPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/db");
    const handymen = await prisma.user.findMany({
      where: { role: "HANDYMAN" },
      select: { id: true },
      take: 500,
    });
    handymanPages = handymen.map((u) => ({
      url: `${base}/handyman/${u.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    }));
  } catch {
    /* build bez DB */
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...seoCombinedPages, ...handymanPages];
}
