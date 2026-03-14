import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plus-jakarta",
  display: "swap",
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
    <html lang="sr" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased bg-[#F3F4F6] text-[#0F172A]">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
