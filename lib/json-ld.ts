/**
 * JSON-LD structured data za SEO.
 * LocalBusiness, Service, FAQPage, Review.
 */

import { getSiteUrl } from "./site-url";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BrziMajstor.ME",
    url: getSiteUrl(),
    description: "Platforma za pronalaženje provjerenih majstora i servisera u Crnoj Gori.",
    areaServed: { "@type": "Country", name: "Crna Gora" },
  };
}

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

export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
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
