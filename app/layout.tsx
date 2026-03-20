import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/app/providers";
import { InstallCTA } from "@/components/pwa/install-cta";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
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
    default: "BrziMajstor.ME – Pronađi majstora brzo i lako u Crnoj Gori",
    template: "%s | BrziMajstor.ME",
  },
  description:
    "BrziMajstor.ME je platforma gdje brzo nalaziš provjerene majstore u Crnoj Gori. Vodoinstalateri, električari, majstori – sve na jednom mjestu.",
  keywords: [
    "majstori Crna Gora",
    "vodoinstalater Podgorica",
    "električar Nikšić",
    "majstor hitno",
    "BrziMajstor",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "BrziMajstor.ME",
    description: "Nađi majstora za 2 minute.",
    url: siteUrl,
    siteName: "BrziMajstor.ME",
    locale: "sr_ME",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrziMajstor.ME",
    description: "Nađi majstora za 2 minute.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${inter.variable} ${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-[100dvh] overflow-x-hidden font-sans antialiased bg-[#FAFBFC] text-[#0F172A] [padding-bottom:env(safe-area-inset-bottom)]">
        <Providers>
          {children}
          <Analytics />
          <ServiceWorkerRegister />
          <InstallCTA />
        </Providers>
      </body>
    </html>
  );
}
