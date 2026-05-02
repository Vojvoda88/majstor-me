import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { SEO_PROBLEMS } from "@/lib/seo-problems-data";
import { getSiteUrl } from "@/lib/site-url";

const EXAMPLES = SEO_PROBLEMS.slice(0, 12);

export const metadata: Metadata = {
  title: "Česti problemi — majstori po gradu",
  description:
    "Vodiči za curenje vode, struju, klimu i druge kućne probleme u Crnoj Gori. Linkovi ka zahtjevu i majstorima u vašem gradu.",
  alternates: { canonical: `${getSiteUrl().replace(/\/$/, "")}/problemi` },
};

export default function ProblemiHubPage() {
  const base = getSiteUrl().replace(/\/$/, "");
  const podgorica = HOMEPAGE_CITIES.find((c) => c.slug === "podgorica") ?? HOMEPAGE_CITIES[0]!;

  return (
    <div className="min-h-screen bg-brand-page pb-16 pt-16 md:pb-10 md:pt-20">
      <PublicHeader />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Česti kućni problemi</h1>
        <p className="mt-3 text-slate-600">
          Odaberite problem da pročitate uzroke i brzo pošaljete jedan zahtjev majstorima. Svaka stranica ima link ka odgovarajućoj
          usluzi u gradu.
        </p>
        <h2 className="mt-10 text-lg font-bold text-slate-900">Primjeri (Podgorica + ostali gradovi u punoj listi u sitemapu)</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {EXAMPLES.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/problemi/${p.slug}-${podgorica.slug}`}
                className="text-blue-700 underline-offset-2 hover:underline"
              >
                {p.slug.replace(/-/g, " ")} — {podgorica.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate-500">
          <Link href="/categories" className="font-semibold text-blue-700 hover:underline">
            Sve kategorije usluga
          </Link>
          <span className="mx-2">·</span>
          <Link href={base} className="font-semibold text-blue-700 hover:underline">
            Početna
          </Link>
        </p>
      </div>
      <PublicFooter />
    </div>
  );
}
