import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InstallHints } from "@/components/pwa/install-hints";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Instaliraj aplikaciju (PWA)",
  description:
    "Dodaj BrziMajstor.ME na početni ekran — brži pristup. Nije u App Store / Play Store.",
  alternates: { canonical: `${baseUrl}/instaliraj` },
  openGraph: {
    title: "Instaliraj aplikaciju | BrziMajstor.ME",
    description:
      "PWA na početnom ekranu: pun ekran, kao obična aplikacija.",
    url: `${baseUrl}/instaliraj`,
    siteName: "BrziMajstor.ME",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Instaliraj aplikaciju | BrziMajstor.ME",
    description: "Dodaj BrziMajstor.ME na telefon kao PWA.",
  },
};

export default function InstalirajPage() {
  return (
    <main className="min-h-screen bg-brand-page">
      <PublicHeader />
      <div className="mx-auto max-w-lg px-4 py-10 pb-24 sm:px-6 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">PWA</p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-brand-navy md:text-3xl">
          Instaliraj BrziMajstor.ME
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Aplikacija nije u App Store / Play Store — radi kao <strong>web aplikacija</strong> koju možeš dodati na početni ekran.
          Jednom instalirano, otvara se u punom ekranu kao obična aplikacija.
        </p>

        <InstallHints />

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">
            ← Nazad na početnu
          </Link>
        </p>
      </div>
      <PublicFooter />
    </main>
  );
}
