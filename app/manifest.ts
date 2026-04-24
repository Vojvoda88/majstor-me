import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PWA_ICON_CACHE_VERSION, pwaIconSrc } from "@/lib/pwa-icon-assets";
import { getSiteUrl } from "@/lib/site-url";

/** Na kanonskom www hostu PWA uvijek otvara www (ne relativni origin — izbjegava mrtve *.vercel.app instalacije). */
export const dynamic = "force-dynamic";

function manifestStartAndScope(): { start_url: string; scope: string } {
  const raw = headers().get("x-forwarded-host") ?? headers().get("host") ?? "";
  const host = raw.toLowerCase().split(":")[0];
  if (host === "www.brzimajstor.me") {
    const base = getSiteUrl().replace(/\/$/, "");
    return { start_url: `${base}/`, scope: `${base}/` };
  }
  return { start_url: "/", scope: "/" };
}

export default function manifest(): MetadataRoute.Manifest {
  const { start_url, scope } = manifestStartAndScope();
  return {
    id: `/?pwa=${PWA_ICON_CACHE_VERSION}`,
    /** Puno ime u installer dijalogu / nekim launcherima */
    name: "BrziMajstor.ME – Pronađi majstora",
    /** Ispod ikone na početnom ekranu (kratko, bez „majstor-me“ slug-a) */
    short_name: "BrziMajstor",
    description: "Marketplace za majstore u Crnoj Gori. Brzo pošaljite zahtjev, majstori vam šalju ponude.",
    start_url,
    scope,
    display: "standalone",
    background_color: "#2563EB",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    icons: [
      { src: pwaIconSrc(192), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: pwaIconSrc(512), sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `/launcher-icon-192-maskable.png?v=${PWA_ICON_CACHE_VERSION}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `/launcher-icon-512-maskable.png?v=${PWA_ICON_CACHE_VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "utilities"],
  };
}
