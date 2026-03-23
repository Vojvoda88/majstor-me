import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { getSeoLandingStaticParams } from "@/lib/seo-landing-config";

/** Jedinstveni URL-evi (42 SEO core + proširena kombinatorika bez duplikata) */
function dedupeSitemapByUrl(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const e of entries) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    out.push(e);
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/request/create`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
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
    priority: 0.7,
  }));

  /** Eksplicitno 42 SEO landing URL-a (glavna strategija) — uvijek u sitemapu */
  const seoCore42: MetadataRoute.Sitemap = getSeoLandingStaticParams().map(({ slug }) => ({
    url: `${base}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  /** Dodatne kombinacije kategorija × gradova (dugi rep) — dedupe sa seoCore42 */
  const seoExtended: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.flatMap((cat) =>
    HOMEPAGE_CITIES.map((city) => ({
      url: `${base}/${cat.slug}-${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.72,
    }))
  );

  const seoLandingPages = dedupeSitemapByUrl([...seoCore42, ...seoExtended]);

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
      priority: 0.6,
    }));
  } catch {
    // Skip handyman pages if DB unavailable at build
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...seoLandingPages, ...handymanPages];
}
