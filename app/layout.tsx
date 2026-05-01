import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/app/providers";
import { auth } from "@/lib/auth";
import { InstallCTA } from "@/components/pwa/install-cta";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { GoogleTranslate } from "@/components/layout/google-translate";
import { pwaIconSrc } from "@/lib/pwa-icon-assets";
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
    default: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    template: "%s | BrziMajstor.ME",
  },
  description:
    "Besplatna objava zahtjeva za majstore u Crnoj Gori. Majstori se javljaju — poziv ili ponuda; vi birate.",
  keywords: [
    "majstori Crna Gora",
    "vodoinstalater Podgorica",
    "električar Nikšić",
    "majstor hitno",
    "BrziMajstor",
  ],
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [pwaIconSrc(192), pwaIconSrc(512)],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    description:
      "Povezivanje korisnika sa majstorima u Crnoj Gori. Besplatna objava zahtjeva; slobodni majstori vas mogu pozvati ili poslati ponudu.",
    url: siteUrl,
    siteName: "BrziMajstor.ME",
    locale: "sr_ME",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BrziMajstor.ME - Majstori u Crnoj Gori",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    description:
      "Besplatna objava zahtjeva; javljaju se majstori — vi birate.",
    images: ["/twitter-image"],
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
  const session = await auth();
  return (
    <html lang="sr-Latn-ME" className={`${inter.variable} ${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-[100dvh] overflow-x-hidden font-sans antialiased bg-[#FAFBFC] text-[#0F172A] [padding-bottom:env(safe-area-inset-bottom)]">
        <Providers session={session}>
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
