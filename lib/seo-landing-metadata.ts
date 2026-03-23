import {
  breadcrumbListEntity,
  organizationEntity,
  schemaWebsiteId,
  websiteEntity,
} from "@/lib/json-ld";
import { cityGenitive, cityLocative } from "@/lib/slugs";

type ParsedSlug = {
  categorySlug: string;
  citySlug: string;
  categoryDisplayName: string;
  cityDisplayName: string;
  internalCategory: string;
};

/**
 * Opisi po kategoriji: lokativ za „u …“ / „u gradu …“, genitiv za „iz …“.
 * Helperi: `cityLocative`, `cityGenitive` (lib/slugs.ts).
 */
export function buildSeoLandingDescription(parsed: ParsedSlug): string {
  const loc = cityLocative(parsed.cityDisplayName);
  const gen = cityGenitive(parsed.cityDisplayName);

  const byCategory: Record<string, string> = {
    vodoinstalater: `Potrebna vam je popravka cijevi, slavina ili instalacija u ${loc}? Na BrziMajstor.ME pregledavate provjerene vodoinstalatere koji rade u ${loc} i okolini. Opišite problem jednom, dobijte više ponuda i izaberite majstora bez zvanja redom.`,
    elektricar: `Tražite električara u ${loc} za novu instalaciju, kućno priključenje ili hitnu intervenciju? Povežite se sa ocijenjenim električarima iz ${gen} na BrziMajstor.ME — ponude stižu brzo, bez obaveze da prihvatite ponudu.`,
    "klima-servis": `Montaža, servis ili punjenje klime u ${loc}? Majstori za klimu uređaje na BrziMajstor.ME odgovaraju iz ${gen} i šire. Jedan zahtjev, više ponuda — uporedite cijene i termine.`,
    keramicar: `Keramičar u ${loc} za kupatila, pločice i završne radove. Pronađite majstore sa recenzijama u ${loc}, pošaljite zahtjev i dobijte konkretne ponude za vaš posao.`,
    stolar: `Stolar u ${loc} za namještaj po mjeri, vrata i drvene obloge. Na BrziMajstor.ME vidite profile stolara iz ${gen}, njihove ocjene i brzo dobijate ponude prilagođene vašem budžetu.`,
    ciscenje: `Profesionalno čišćenje stanova i poslovnih prostora u ${loc}. Provjereni majstori za čišćenje u ${loc} na jednom mjestu — zatražite ponude i uštedite vrijeme na traženju preporuka.`,
  };

  return (
    byCategory[parsed.categorySlug] ??
    `Pronađite ${parsed.categoryDisplayName.toLowerCase()} u ${loc}. BrziMajstor.ME povezuje vas sa provjerenim majstorima u ${loc} — besplatan zahtjev, više ponuda.`
  );
}

export function buildSeoLandingTitle(parsed: ParsedSlug): string {
  const loc = cityLocative(parsed.cityDisplayName);
  return `${parsed.categoryDisplayName} u ${loc}`;
}

export type SeoLandingJsonLdInput = {
  canonicalUrl: string;
  siteUrl: string;
  title: string;
  description: string;
  parsed: ParsedSlug;
};

/** WebPage + BreadcrumbList + dijeljeni Organization/WebSite @id (bez odvojenog Service — sadržaj je već u opisu stranice). */
export function buildSeoLandingJsonLd({
  canonicalUrl,
  siteUrl,
  title,
  description,
  parsed,
}: SeoLandingJsonLdInput): Record<string, unknown> {
  const root = siteUrl.replace(/\/$/, "");
  const cityGradUrl = `${root}/grad/${parsed.citySlug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationEntity(root),
      websiteEntity(root),
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${title} | BrziMajstor.ME`,
        description,
        isPartOf: { "@id": schemaWebsiteId(root) },
      },
      breadcrumbListEntity([
        { name: "Početna", itemUrl: root },
        { name: parsed.cityDisplayName, itemUrl: cityGradUrl },
        { name: parsed.categoryDisplayName, itemUrl: canonicalUrl },
      ]),
    ],
  };
}

/** Za <head> canonical — uvijek apsolutni URL bez duplog slash-a */
export function buildSeoCanonical(base: string, slug: string): string {
  const root = base.replace(/\/$/, "");
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  return `${root}${path}`;
}
