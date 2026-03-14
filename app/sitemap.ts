import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { POPULAR_CATEGORIES } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/request/create`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = POPULAR_CATEGORIES.map((c) => ({
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

  return [...staticPages, ...categoryPages, ...cityPages, ...handymanPages];
}
