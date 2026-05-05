import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/app/providers";
import { InstallCTA } from "@/components/pwa/install-cta";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { GoogleTranslate } from "@/components/layout/google-translate";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_ORGANIZATION_DESCRIPTION,
  SEO_OG_IMAGE,
  SEO_OG_IMAGE_PATH,
} from "@/lib/seo-brand";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  weight: ["500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  /** Ime PWA / „Dodaj na početni ekran“ (iOS koristi apple-mobile-web-app-title) */
  applicationName: "BrziMajstor.ME",
  appleWebApp: {
    capable: true,
    title: "BrziMajstor.ME",
    statusBarStyle: "default",
  },
  title: {
    default: "BrziMajstor.ME — majstori Podgorica, Budva, cijela Crna Gora",
    template: "%s | BrziMajstor.ME",
  },
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  manifest: "/manifest.webmanifest",
  /** Favicon: `app/icon.tsx` (oštra mala ikona). PWA launcher ikone ostaju u manifest.webmanifest. */
  icons: {
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BrziMajstor.ME — zatraži majstora u Crnoj Gori",
    description: SEO_ORGANIZATION_DESCRIPTION,
    url: siteUrl,
    siteName: "BrziMajstor.ME",
    locale: "sr_ME",
    type: "website",
    images: [SEO_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrziMajstor.ME — majstori širom Crne Gore",
    description: SEO_DEFAULT_DESCRIPTION,
    images: [SEO_OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  /** Standardni PWA tag; smanjuje deprecation upozorenje uz apple-mobile-web-app-capable iz appleWebApp. */
  other: {
    "mobile-web-app-capable": "yes",
    "geo.region": "ME",
    "geo.placename": "Montenegro",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr-Latn-ME" className={`${inter.variable} ${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-[100dvh] overflow-x-hidden font-sans antialiased bg-[#FAFBFC] text-[#0F172A] [padding-bottom:env(safe-area-inset-bottom)]">
        <Providers>
          {children}
          <Analytics />
          <ServiceWorkerRegister />
          <InstallCTA />
          <GoogleTranslate />
        </Providers>
      </body>
    </html>
  );
}
