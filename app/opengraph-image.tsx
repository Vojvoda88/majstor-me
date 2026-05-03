import { ImageResponse } from "next/og";
import { getOgSiteHeaderMarkDataUrl } from "@/lib/og-inline-logo";
import { OgShareCard } from "@/lib/og-share-card";
import { SEO_BRAND_SLOGAN, SEO_HERO_HEADLINE, SEO_HERO_SUBLINE } from "@/lib/seo-brand";

/** Node: čita logo sa diska (Edge fetch često ne učita isto što i produkcijski CDN cache). */
export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = `${SEO_HERO_HEADLINE} — BrziMajstor.ME`;

export default function OpenGraphImage() {
  const markDataUrl = getOgSiteHeaderMarkDataUrl();
  return new ImageResponse(
    (
      <OgShareCard
        markDataUrl={markDataUrl}
        headline={SEO_HERO_HEADLINE}
        subline={SEO_HERO_SUBLINE}
        footerTag={SEO_BRAND_SLOGAN}
      />
    ),
    size
  );
}
