import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/app/providers";
import { auth } from "@/lib/auth";
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
    default: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    template: "%s | BrziMajstor.ME",
  },
  description:
    "Povezivanje korisnika sa majstorima u Crnoj Gori. Objavite zahtjev besplatno — javljaju se majstori kojima posao odgovara; ponude i ocjene vidite uz svoj zahtjev kada stignu.",
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
    title: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    description:
      "Povezivanje korisnika sa majstorima u Crnoj Gori. Besplatna objava zahtjeva; više majstora može da se javi — uporedite ponude prije odluke.",
    url: siteUrl,
    siteName: "BrziMajstor.ME",
    locale: "sr_ME",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrziMajstor.ME – Zahtjev za majstore u Crnoj Gori",
    description:
      "Povezivanje korisnika sa majstorima u Crnoj Gori. Besplatna objava zahtjeva; više majstora može da se javi — uporedite ponude prije odluke.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="sr" className={`${inter.variable} ${dmSans.variable} ${outfit.variable}`}>
      <body className="min-h-[100dvh] overflow-x-hidden font-sans antialiased bg-[#FAFBFC] text-[#0F172A] [padding-bottom:env(safe-area-inset-bottom)]">
        <Providers session={session}>
          {children}
          <Analytics />
          <ServiceWorkerRegister />
          <InstallCTA />
        </Providers>
      </body>
    </html>
  );
}
