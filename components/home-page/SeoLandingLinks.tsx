import Link from "next/link";
import { MapPin } from "lucide-react";
import { SEO_LANDING_HOMEPAGE_LINKS } from "@/lib/seo-landing-config";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

const HOMEPAGE_GRAD_LINKS = HOMEPAGE_CITIES.slice(0, 8);

/** Interni linkovi ka SEO landing stranicama (usluga + grad) i gradovskim hub-ovima */
export function SeoLandingLinks() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-marketplace-sm md:rounded-3xl md:p-8">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 md:mb-4 md:text-sm">
        <MapPin className="h-4 w-4 text-blue-600" aria-hidden />
        Popularne kombinacije
      </div>
      <h2 className="font-display text-xl font-bold text-brand-navy md:text-2xl">
        Pronađite majstora u svom gradu
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
        Brzi pregled usluga po gradovima — stranice optimizovane za pretragu na Googleu.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 md:mt-6 md:gap-3">
        {SEO_LANDING_HOMEPAGE_LINKS.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${item.slug}`}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 md:px-4"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-slate-200/80 pt-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Gradovi</p>
        <p className="mt-2 text-sm text-slate-600">
          Pregled svih usluga u gradu — jedan hub, više kategorija.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {HOMEPAGE_GRAD_LINKS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/grad/${c.slug}`}
                className="inline-flex rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/80"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link
            href="/categories"
            className="font-semibold text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
          >
            Sve kategorije
          </Link>
          <span className="mx-2 text-slate-300" aria-hidden>
            ·
          </span>
          <Link
            href="/request/create"
            className="font-semibold text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline"
          >
            Objavi zahtjev
          </Link>
        </p>
      </div>
    </section>
  );
}
