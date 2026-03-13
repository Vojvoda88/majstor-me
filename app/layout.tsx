import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Majstor.me | Pronađite majstora u Crnoj Gori",
  description: "Platforma za pronalaženje provjerenih majstora i servisera u Crnoj Gori.",
  keywords: "majstor, Crna Gora, Podgorica, vodoinstalater, električar, klima servis",
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
    <html lang="sr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
