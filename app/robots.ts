import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/admin/",
        "/api/",
        "/verify-email",
        "/verify-pending",
        "/request-access/",
        "/auth/",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/kontakt",
      ],
    },
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
