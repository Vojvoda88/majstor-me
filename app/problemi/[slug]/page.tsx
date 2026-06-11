import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ProblemiRequestCta } from "@/components/public/ProblemiRequestCta";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getCategoryBySlug } from "@/lib/categories";
import { buildProblemPageJsonLd } from "@/lib/json-ld";
import {
  parseProblemCitySlug,
} from "@/lib/seo-problems-data";
import { getSiteUrl } from "@/lib/site-url";
import { cityLocative, phraseUGradu } from "@/lib/slugs";
import { buildAlternates, getLocaleFromHeaderValue, LOCALE_HEADER, localizedPath } from "@/lib/i18n/seo";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const locale = getLocaleFromHeaderValue(headers().get(LOCALE_HEADER));
  const { slug } = await params;
  const parsed = parseProblemCitySlug(slug);
  if (!parsed) return { title: { absolute: "BrziMajstor.ME" } };
  const { problem, cityName } = parsed;
  const cityLoc = cityLocative(cityName);
  const titleCore = problem.metaTitle(cityName).split("|")[0]?.trim() ?? problem.metaTitle(cityName);
  const title = `${titleCore} | BrziMajstor.ME`;
  const description = problem.metaDescription(cityLoc, cityName);
  const base = getSiteUrl();
  const canonicalPath = `/problemi/${slug}`;
  const canonical = `${base.replace(/\/$/, "")}${localizedPath(canonicalPath, locale)}`;
  const tw = title;
  return {
    title,
    description,
    alternates: buildAlternates(base, canonicalPath, locale),
    openGraph: { title: tw, description, url: canonical, siteName: "BrziMajstor.ME", type: "article" },
    twitter: { card: "summary_large_image", title: tw, description },
  };
}

export default async function ProblemSeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const parsed = parseProblemCitySlug(slug);
  if (!parsed) notFound();

  const { problem, citySlug, cityName } = parsed;
  const cat = getCategoryBySlug(problem.relatedServiceSlug);
  if (!cat) notFound();

  const cityLoc = cityLocative(cityName);
  const base = getSiteUrl().replace(/\/$/, "");
  const canonical = `${base}/problemi/${slug}`;
  const intro = problem.intro(cityLoc, cityName);
  const createUrl = `/request/create?category=${encodeURIComponent(cat.internalCategory)}&city=${encodeURIComponent(cityName)}`;
  const serviceCityUrl = `/${problem.relatedServiceSlug}/${citySlug}`;

  const pageH1 =
    problem.metaTitle(cityName).split("|")[0]?.trim() ?? problem.metaTitle(cityName);

  const jsonLd = buildProblemPageJsonLd({
    canonicalUrl: canonical,
    pageTitle: pageH1,
    description: problem.metaDescription(cityLoc, cityName),
    breadcrumbs: [
      { name: "Početna", itemUrl: base },
      { name: "Problemi", itemUrl: `${base}/problemi` },
      { name: pageH1, itemUrl: canonical },
    ],
    faqs: problem.faqs,
    serviceTypeLabel: cat.displayName,
    cityName,
  });

  return (
    <div className="min-h-screen bg-brand-page pb-16 pt-16 md:pb-10 md:pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Početna
          </Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:text-slate-700">
            Kategorije
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-800">{cityName}</span>
        </nav>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Problem u gradu</p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">{pageH1}</h1>

        <p className="mt-5 text-base leading-relaxed text-slate-700 sm:text-[1.05rem]">{intro}</p>

        {problem.causes.length > 0 && (
          <>
            <h2 className="mt-10 text-lg font-bold text-slate-900">Mogući uzroci</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
              {problem.causes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Objavi zahtjev i dobij ponude za 10 minuta</h2>
          <p className="mt-2 text-sm text-slate-600">
            Jedan opis problema {phraseUGradu(cityName)} — majstori kojima posao odgovara javljaju se s ponudama. Besplatno za
            korisnike.
          </p>
          <ProblemiRequestCta createUrl={createUrl} />
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Povezano</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pregled majstora za <strong>{cat.displayName}</strong> u {cityLoc}:{" "}
            <Link href={serviceCityUrl} className="font-semibold text-blue-700 underline-offset-2 hover:underline">
              {cat.displayName} — {cityName}
            </Link>
            {" · "}
            <Link href={`/grad/${citySlug}`} className="font-semibold text-blue-700 underline-offset-2 hover:underline">
              Sve usluge u {cityLoc}
            </Link>
            {" · "}
            <Link href={`/category/${problem.relatedServiceSlug}`} className="font-semibold text-blue-700 underline-offset-2 hover:underline">
              {cat.displayName} — cijela Crna Gora
            </Link>
          </p>
        </section>

        <section className="mt-10 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Često postavljana pitanja</h2>
          {problem.faqs.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold text-slate-800">{f.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </div>
          ))}
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
