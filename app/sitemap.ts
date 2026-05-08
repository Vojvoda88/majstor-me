import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { prismaWhereHandymanSitemapEligible } from "@/lib/handyman-sitemap-eligibility";
import { getProgrammaticServiceCityParams } from "@/lib/seo-programmatic-config";
import { getProblemCityStaticParams } from "@/lib/seo-problems-data";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

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
  const localized = (path: string) =>
    SUPPORTED_LOCALES.map((locale) => `${base}/${locale}${path === "/" ? "" : path}`);

  const staticPages: MetadataRoute.Sitemap = [
    ...localized("/").map((url) => ({ url, lastModified: now, changeFrequency: "weekly" as const, priority: 1 })),
    ...localized("/categories").map((url) => ({ url, lastModified: now, changeFrequency: "weekly" as const, priority: 0.92 })),
    ...localized("/request/create").map((url) => ({ url, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 })),
    ...localized("/kako-radi-korisnici").map((url) => ({ url, lastModified: now, changeFrequency: "monthly" as const, priority: 0.72 })),
    ...localized("/kako-radi-majstori").map((url) => ({ url, lastModified: now, changeFrequency: "monthly" as const, priority: 0.72 })),
    ...localized("/politika-privatnosti").map((url) => ({ url, lastModified: now, changeFrequency: "yearly" as const, priority: 0.35 })),
    ...localized("/uslovi-koriscenja").map((url) => ({ url, lastModified: now, changeFrequency: "yearly" as const, priority: 0.35 })),
    ...localized("/instaliraj").map((url) => ({ url, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...localized("/problemi").map((url) => ({ url, lastModified: now, changeFrequency: "weekly" as const, priority: 0.82 })),
    ...localized("/kontakt").map((url) => ({ url, lastModified: now, changeFrequency: "monthly" as const, priority: 0.55 })),
  ];

  const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.flatMap((c) =>
    localized(`/category/${c.slug}`).map((url) => ({
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  const cityPages: MetadataRoute.Sitemap = HOMEPAGE_CITIES.flatMap((c) =>
    localized(`/grad/${c.slug}`).map((url) => ({
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))
  );

  /** Kanonski format /{usluga}/{grad} — ~15×20 */
  const pairs = getProgrammaticServiceCityParams();
  const serviceCityPages: MetadataRoute.Sitemap = pairs.flatMap(({ slug, city }) =>
    localized(`/${slug}/${city}`).map((url) => ({
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: SEO_CORE_CITY_SLUGS.has(city) ? 0.84 : 0.7,
    }))
  );

  /** Long-tail /problemi/{problem}-{grad} */
  const problemPages: MetadataRoute.Sitemap = getProblemCityStaticParams().flatMap(({ slug }) =>
    localized(`/problemi/${slug}`).map((url) => ({
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.72,
    }))
  );

  let handymanPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/db");
    const handymen = await prisma.user.findMany({
      where: prismaWhereHandymanSitemapEligible(),
      select: { id: true },
      take: 500,
    });
    handymanPages = handymen.flatMap((u) =>
      localized(`/handyman/${u.id}`).map((url) => ({
        url,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.55,
      }))
    );
  } catch {
    /* build bez DB */
  }

  return [...staticPages, ...categoryPages, ...cityPages, ...serviceCityPages, ...problemPages, ...handymanPages];
}
