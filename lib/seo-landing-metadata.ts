import {
  breadcrumbListEntity,
  organizationEntity,
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

/** WebPage + BreadcrumbList + deljeni Organization/WebSite @id (bez odvojenog Service — sadržaj je već u opisu stranice). */
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
      breadcrumbListEntity([
        { name: "Početna", itemUrl: root },
        { name: parsed.cityDisplayName, itemUrl: cityGradUrl },
        { name: parsed.categoryDisplayName, itemUrl: canonicalUrl },
      ]),
    ],
  };
}

/** Za <head> canonical — uvijek apsolutni URL bez duplog slash-a */
export function buildSeoCanonical(base: string, slug: string): string {
  const root = base.replace(/\/$/, "");
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  return `${root}${path}`;
}
