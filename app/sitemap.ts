import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { prismaWhereHandymanSitemapEligible } from "@/lib/handyman-sitemap-eligibility";
import { getProgrammaticServiceCityParams } from "@/lib/seo-programmatic-config";
import { getProblemCityStaticParams } from "@/lib/seo-problems-data";

/** Jezgro gradovi (Podgorica, primorski…) — malo viši prioritet u kombinovanim URL-ovima */
const SEO_CORE_CITY_SLUGS = new Set([
  "podgorica",
  "niksic",
  "budva",
  "bar",
  "herceg-novi",
  "tivat",
  "kotor",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: `${base}/request/create`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/kako-radi-korisnici`, lastModified: now, changeFrequency: "monthly", priority: 0.72 },
    { url: `${base}/kako-radi-majstori`, lastModified: now, changeFrequency: "monthly", priority: 0.72 },
    { url: `${base}/politika-privatnosti`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/uslovi-koriscenja`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/instaliraj`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/problemi`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "monthly", priority: 0.55 },
  ];

  const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = HOMEPAGE_CITIES.map((c) => ({
    url: `${base}/grad/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  /** Kanonski format /{usluga}/{grad} — ~15×20 */
  const pairs = getProgrammaticServiceCityParams();
  const serviceCityPages: MetadataRoute.Sitemap = pairs.map(({ slug, city }) => ({
    url: `${base}/${slug}/${city}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: SEO_CORE_CITY_SLUGS.has(city) ? 0.84 : 0.7,
  }));

  /** Long-tail /problemi/{problem}-{grad} */
  const problemPages: MetadataRoute.Sitemap = getProblemCityStaticParams().map(({ slug }) => ({
    url: `${base}/problemi/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.72,
  }));

  let handymanPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/db");
    const handymen = await prisma.user.findMany({
      where: prismaWhereHandymanSitemapEligible(),
      select: { id: true },
      take: 500,
    });
    handymanPages = handymen.map((u) => ({
      url: `${base}/handyman/${u.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.55,
    }));
  } catch {
    /* build bez DB */
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...serviceCityPages, ...problemPages, ...handymanPages];
}
