import Link from "next/link";
import { MapPin } from "lucide-react";
import { SEO_LANDING_HOMEPAGE_LINKS } from "@/lib/seo-landing-config";

/** Interni linkovi ka SEO landing stranicama (majstor + grad) */
export function SeoLandingLinks() {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-marketplace-sm md:p-8">
      <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
        <MapPin className="h-4 w-4 text-blue-600" aria-hidden />
        Popularne kombinacije
      </div>
      <h2 className="font-display text-xl font-bold text-brand-navy md:text-2xl">
        Pronađite majstora u svom gradu
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
        Brzi pregled usluga po gradovima — stranice optimizovane za pretragu na Googleu.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2 md:gap-3">
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
    </section>
  );
}
