import { ImageResponse } from "next/og";
import { getOgSiteHeaderMarkDataUrl } from "@/lib/og-inline-logo";
import { OgShareCard } from "@/lib/og-share-card";
import { SEO_BRAND_SLOGAN, SEO_HERO_HEADLINE, SEO_HERO_SUBLINE } from "@/lib/seo-brand";

/** Node: čita logo sa diska (Edge fetch često ne učita isto što i produkcijski CDN cache). */
export const runtime = "nodejs";

/** Spriječi godinu dana „zaleđenu“ OG sliku na Vercelu (default je bio immutable + max-age=31536000). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    {
      ...size,
      headers: {
        "Cache-Control":
          "public, max-age=120, s-maxage=600, stale-while-revalidate=86400, must-revalidate",
      },
    }
  );
}
