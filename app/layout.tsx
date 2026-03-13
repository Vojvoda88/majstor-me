import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const font = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Majstor.me | Povezujemo korisnike i majstore - Crna Gora",
  description: "Marketplace za majstore i zanatlije u Crnoj Gori. Nađi pouzdanog majstora ili objavi zahtjev.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
