import {
  breadcrumbListEntity,
  organizationEntity,
  schemaOrganizationId,
  schemaWebsiteId,
  websiteEntity,
} from "@/lib/json-ld";
import type { SeoCombinedParsed } from "@/lib/seo-landing-copy";

export {
  buildSeoLandingDescription,
  buildSeoLandingTitle,
  type SeoCombinedParsed,
} from "@/lib/seo-landing-copy";

export type SeoLandingJsonLdInput = {
  canonicalUrl: string;
  siteUrl: string;
  title: string;
  description: string;
  parsed: SeoCombinedParsed;
};

/** WebPage + Service + BreadcrumbList + Organization/WebSite @id */
export function buildSeoLandingJsonLd({
  canonicalUrl,
  siteUrl,
  title,
  description,
  parsed,
}: SeoLandingJsonLdInput): Record<string, unknown> {
  const root = siteUrl.replace(/\/$/, "");
  const cityGradUrl = `${root}/grad/${parsed.citySlug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(root),
      websiteEntity(root),
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${title} | BrziMajstor.ME`,
        description,
        isPartOf: { "@id": schemaWebsiteId(root) },
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: `${parsed.categoryDisplayName} — ${parsed.cityDisplayName}`,
        serviceType: parsed.internalCategory,
        provider: { "@id": schemaOrganizationId(root) },
        areaServed: {
          "@type": "AdministrativeArea",
          name: parsed.cityDisplayName,
          addressCountry: "ME",
        },
      },
      breadcrumbListEntity([
        { name: "Početna", itemUrl: root },
        { name: parsed.cityDisplayName, itemUrl: cityGradUrl },
        { name: parsed.categoryDisplayName, itemUrl: canonicalUrl },
      ]),
    ],
  };
}

/** Kanonski URL za novi format /{kategorija}/{grad} */
export function buildSeoServiceCityCanonical(base: string, categorySlug: string, citySlug: string): string {
  const root = base.replace(/\/$/, "");
  return `${root}/${categorySlug}/${citySlug}`;
}

/** Za <head> canonical — uvijek apsolutni URL bez duplog slash-a */
export function buildSeoCanonical(base: string, slug: string): string {
  const root = base.replace(/\/$/, "");
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  return `${root}${path}`;
}
