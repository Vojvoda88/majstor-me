/**
 * JSON-LD structured data (SEO) — čisti, istiniti entiteti; bez lažnih ratinga.
 */

import {
  SEO_BRAND_SLOGAN,
  SEO_HOME_DESCRIPTION,
  SEO_ORGANIZATION_DESCRIPTION,
} from "./seo-brand";
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
    alternateName: ["Brzi Majstor", "BrziMajstor ME"],
    url: root,
    logo: `${root}/brand/brzimajstor-logo-horizontal-user.png`,
    slogan: SEO_BRAND_SLOGAN,
    description: SEO_ORGANIZATION_DESCRIPTION,
    knowsAbout: [
      "Majstorske usluge",
      "Popravke u stanu i kući",
      "Vodoinstalacija",
      "Elektroinstalacije",
      "Klima uređaji",
      "Keramičarski radovi",
      "Čišćenje",
      "Selidbe",
    ],
    areaServed: [
      { "@type": "Country", name: "Crna Gora" },
      { "@type": "AdministrativeArea", name: "Podgorica" },
      { "@type": "AdministrativeArea", name: "Budva" },
      { "@type": "AdministrativeArea", name: "Nikšić" },
      { "@type": "AdministrativeArea", name: "Bar" },
      { "@type": "AdministrativeArea", name: "Kotor" },
    ],
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
    description: SEO_ORGANIZATION_DESCRIPTION,
    publisher: { "@id": schemaOrganizationId(siteUrl) },
  };
}

/** Jedan @graph: Organization + WebSite + WebPage + FAQPage (FAQ mora odgovarati vidljivom FAQ u DOM-u). */
export function buildHomeJsonLdGraph(faqs: FaqItem[]): Record<string, unknown> {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(siteUrl),
      websiteEntity(siteUrl),
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: "BrziMajstor.ME — majstori i majstorske usluge u Crnoj Gori",
        description: SEO_HOME_DESCRIPTION,
        isPartOf: { "@id": schemaWebsiteId(siteUrl) },
        about: { "@id": schemaOrganizationId(siteUrl) },
      },
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

/** Stranica problema (long-tail): Organization + WebSite + WebPage + FAQPage + Service + BreadcrumbList */
export function buildProblemPageJsonLd(opts: {
  canonicalUrl: string;
  pageTitle: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  faqs: FaqItem[];
  serviceTypeLabel: string;
  cityName: string;
}): Record<string, unknown> {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const { canonicalUrl, pageTitle, description, breadcrumbs, faqs, serviceTypeLabel, cityName } = opts;
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
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        isPartOf: { "@id": `${canonicalUrl}#webpage` },
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
      {
        "@type": "Service",
        "@id": `${canonicalUrl}#service`,
        name: `${serviceTypeLabel} — ${cityName}`,
        serviceType: serviceTypeLabel,
        provider: { "@id": schemaOrganizationId(siteUrl) },
        areaServed: { "@type": "AdministrativeArea", name: cityName, addressCountry: "ME" },
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
