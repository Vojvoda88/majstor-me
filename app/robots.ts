import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const localizedDisallow = SUPPORTED_LOCALES.flatMap((locale) => [
    `/${locale}/verify-email`,
    `/${locale}/verify-pending`,
    `/${locale}/request-access/`,
    `/${locale}/auth/`,
    `/${locale}/login`,
    `/${locale}/register`,
    `/${locale}/forgot-password`,
    `/${locale}/reset-password`,
  ]);

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
        ...localizedDisallow,
      ],
    },
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
