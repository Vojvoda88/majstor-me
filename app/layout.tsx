import type { Metadata, Viewport } from "next";
import { Inter, DM_Sans, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Majstor.me | Pronađite majstora u Crnoj Gori",
  description: "Platforma za pronalaženje provjerenih majstora i servisera u Crnoj Gori.",
  keywords: "majstor, Crna Gora, Podgorica, vodoinstalater, električar, klima servis",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Majstor.me | Pronađite majstora u Crnoj Gori",
    description: "Platforma za pronalaženje provjerenih majstora i servisera u Crnoj Gori.",
    type: "website",
    locale: "sr_ME",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={`${inter.variable} ${dmSans.variable} ${outfit.variable}`}>
      <body className="font-[family-name:var(--font-dm-sans)] antialiased bg-[#FAFBFC] text-[#0F172A]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
