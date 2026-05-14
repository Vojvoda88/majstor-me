import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { getProgrammaticServiceCityParams } from "@/lib/seo-programmatic-config";
import { getProblemCityStaticParams } from "@/lib/seo-problems-data";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

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
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();
  const canonicalUrl = (path: string) => `${base}/${DEFAULT_LOCALE}${path === "/" ? "" : path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.92 },
    { url: canonicalUrl("/request/create"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: canonicalUrl("/kako-radi-korisnici"), lastModified: now, changeFrequency: "monthly", priority: 0.72 },
    { url: canonicalUrl("/kako-radi-majstori"), lastModified: now, changeFrequency: "monthly", priority: 0.72 },
    { url: canonicalUrl("/politika-privatnosti"), lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: canonicalUrl("/uslovi-koriscenja"), lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: canonicalUrl("/instaliraj"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/problemi"), lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    { url: canonicalUrl("/kontakt"), lastModified: now, changeFrequency: "monthly", priority: 0.55 },
  ];

  try {
    const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_LISTING.map((c) => ({
      url: canonicalUrl(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const cityPages: MetadataRoute.Sitemap = HOMEPAGE_CITIES.map((c) => ({
      url: canonicalUrl(`/grad/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const pairs = getProgrammaticServiceCityParams();
    const serviceCityPages: MetadataRoute.Sitemap = pairs.map(({ slug, city }) => ({
      url: canonicalUrl(`/${slug}/${city}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: SEO_CORE_CITY_SLUGS.has(city) ? 0.84 : 0.7,
    }));

    const problemPages: MetadataRoute.Sitemap = getProblemCityStaticParams().map(({ slug }) => ({
      url: canonicalUrl(`/problemi/${slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.72,
    }));

    return [...staticPages, ...categoryPages, ...cityPages, ...serviceCityPages, ...problemPages];
  } catch (e) {
    console.error("[sitemap] fallback to static pages only", e);
    return staticPages;
  }
}
