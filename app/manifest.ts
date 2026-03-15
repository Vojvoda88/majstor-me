import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Majstor.me - Pronađite majstora",
    short_name: "Majstor.me",
    description: "Marketplace za majstore u Crnoj Gori. Brzo pošaljite zahtjev, majstori vam šalju ponude.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "utilities"],
  };
}
