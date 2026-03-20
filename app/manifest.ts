import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    /** Puno ime u installer dijalogu / nekim launcherima */
    name: "BrziMajstor.ME – Pronađi majstora",
    /** Ispod ikone na početnom ekranu (kratko, bez „majstor-me“ slug-a) */
    short_name: "BrziMajstor",
    description: "Marketplace za majstore u Crnoj Gori. Brzo pošaljite zahtjev, majstori vam šalju ponude.",
    start_url: "/",
    display: "standalone",
    background_color: "#2563EB",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "utilities"],
  };
}
