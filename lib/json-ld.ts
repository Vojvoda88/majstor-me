/**
 * JSON-LD structured data (SEO) — čisti, istiniti entiteti; bez lažnih ratinga.
 */

import { getSiteUrl } from "./site-url";

export type FaqItem = { q: string; a: string };

/** Jedinstveni @id za isti sajt na svim stranicama (Google preporuka za povezivanje grafa). */
export function schemaOrganizationId(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/#organization`;
}

export function schemaWebsiteId(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/#website`;
}

export function organizationEntity(siteUrl: string): Record<string, unknown> {
  const root = siteUrl.replace(/\/$/, "");
  return {
    "@type": "Organization",
    "@id": schemaOrganizationId(siteUrl),
    name: "BrziMajstor.ME",
    url: root,
    description:
      "Platforma za povezivanje korisnika sa majstorima i serviserima u Crnoj Gori — objava zahtjeva i pregled ponuda.",
    areaServed: { "@type": "Country", name: "Crna Gora" },
  };
}

export function websiteEntity(siteUrl: string): Record<string, unknown> {
  const root = siteUrl.replace(/\/$/, "");
  return {
    "@type": "WebSite",
    "@id": schemaWebsiteId(siteUrl),
    name: "BrziMajstor.ME",
    url: root,
    inLanguage: "sr-Latn",
    publisher: { "@id": schemaOrganizationId(siteUrl) },
  };
}

/** Jedan @graph: Organization + WebSite + FAQPage (FAQ mora odgovarati vidljivom FAQ u DOM-u). */
export function buildHomeJsonLdGraph(faqs: FaqItem[]): Record<string, unknown> {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(siteUrl),
      websiteEntity(siteUrl),
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faqpage`,
        isPartOf: { "@id": schemaWebsiteId(siteUrl) },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };
}

/** Zadržano za kompatibilnost — preferiraj `buildHomeJsonLdGraph` na homepageu. */
export function organizationJsonLd() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    ...organizationEntity(siteUrl),
  };
}

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export type BreadcrumbItem = { name: string; itemUrl: string };

export function breadcrumbListEntity(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: b.itemUrl,
    })),
  };
}

/**
 * Javna listing stranica: Organization + WebSite + WebPage + BreadcrumbList u jednom grafu.
 */
export function buildPublicListingPageJsonLd(opts: {
  canonicalUrl: string;
  pageTitle: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
}): Record<string, unknown> {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const { canonicalUrl, pageTitle, description, breadcrumbs } = opts;
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(siteUrl),
      websiteEntity(siteUrl),
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${pageTitle} | BrziMajstor.ME`,
        description,
        isPartOf: { "@id": schemaWebsiteId(siteUrl) },
      },
      breadcrumbListEntity(breadcrumbs),
    ],
  };
}

/**
 * Profil majstora: LocalBusiness samo sa podacima koji postoje na stranici (rating samo ako ima recenzija).
 */
export function localBusinessJsonLd(props: {
  name: string;
  description?: string;
  image?: string;
  address?: { city: string };
  aggregateRating?: { ratingValue: number; reviewCount: number };
}) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: props.name,
    description: props.description ?? "Majstor u Crnoj Gori",
    ...(props.image && { image: props.image }),
    ...(props.address && {
      address: { "@type": "PostalAddress", addressLocality: props.address.city },
    }),
  };
  if (props.aggregateRating) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: props.aggregateRating.ratingValue,
      reviewCount: props.aggregateRating.reviewCount,
      bestRating: 5,
    };
  }
  return base;
}
