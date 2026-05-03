import { ImageResponse } from "next/og";
import { getOgHorizontalLogoDataUrl } from "@/lib/og-inline-logo";
import { OgShareCard } from "@/lib/og-share-card";
import { SEO_BRAND_SLOGAN, SEO_HERO_HEADLINE, SEO_HERO_SUBLINE } from "@/lib/seo-brand";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = `${SEO_HERO_HEADLINE} — BrziMajstor.ME`;

export default function TwitterImage() {
  const logoDataUrl = getOgHorizontalLogoDataUrl();
  return new ImageResponse(
    (
      <OgShareCard
        logoDataUrl={logoDataUrl}
        headline={SEO_HERO_HEADLINE}
        subline={SEO_HERO_SUBLINE}
        footerTag={SEO_BRAND_SLOGAN}
      />
    ),
    size
  );
}
