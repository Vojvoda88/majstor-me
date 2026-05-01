/**
 * Tekstovi za SEO landing stranice (kategorija, grad, kombinovane rute).
 * Isti izvori za <meta> i uvode — bez praznog „SEO spama“ i pretjeranih obećanja.
 */

import { cityGenitive, cityLocative } from "@/lib/slugs";

export function categoryMetaTitle(displayName: string): string {
  return `${displayName} — majstori u Crnoj Gori`;
}

export function categoryMetaDescription(displayName: string): string {
  return `${displayName} u Crnoj Gori: profili majstora, filter po gradu, besplatan zahtjev ako želite ponude od više strana.`;
}

export function gradMetaTitle(cityLocative: string): string {
  return `Majstori u ${cityLocative}`;
}

export function gradMetaDescription(cityLocative: string, cityName: string): string {
  return `${cityName}: majstori po kategorijama na jednom mjestu — profili sa ocjenama ili jedan zahtjev za ponude. Bez obaveze da odmah birate izvođača.`;
}

/** Isti oblik kao rezultat `parseCategoryCitySlug` */
export type SeoCombinedParsed = {
  categorySlug: string;
  citySlug: string;
  categoryDisplayName: string;
  cityDisplayName: string;
  internalCategory: string;
};

export function buildSeoLandingTitle(parsed: SeoCombinedParsed): string {
  const loc = cityLocative(parsed.cityDisplayName);
  return `${parsed.categoryDisplayName} u ${loc}`;
}

export function buildSeoLandingDescription(parsed: SeoCombinedParsed): string {
  const loc = cityLocative(parsed.cityDisplayName);
  const gen = cityGenitive(parsed.cityDisplayName);

  const byCategory: Record<string, string> = {
    vodoinstalater: `Vodoinstalater u ${loc}: profili ispod ili besplatan zahtjev — opišite curenje, zamenu ili instalaciju i sačekajte odgovore majstora.`,
    elektricar: `Električar u ${loc} za instalacije, priključenje ili popravke. Profili ispod; jedan zahtjev šalje opis majstorima iz ${gen} koji rade tu vrstu posla.`,
    "klima-servis": `Klima servis u ${loc}: montaža, punjenje, servis. Pregledajte profile ili objavite zahtjev da se zainteresovani majstori jave.`,
    keramicar: `Keramičar u ${loc} za kupatila, pločice i završne radove. Lista ispod; jedan zahtjev šalje opis majstorima ako želite da vam se jave više njih.`,
    stolar: `Stolar u ${loc} za namještaj, vrata i drvo. Profili ispod; zahtjev možete ostaviti sa dimenzijama i rokom.`,
    ciscenje: `Čišćenje stanova i poslovnih prostora u ${loc}. Pregledajte profile ili pošaljite zahtjev za procjenu površine i termina.`,
  };

  return (
    byCategory[parsed.categorySlug] ??
    `${parsed.categoryDisplayName} u ${loc}: pregled majstora i besplatan zahtjev ako želite ponude od više strana.`
  );
}

/**
 * Kratak uvod za kombinovanu SEO stranicu (različit ton od čiste kategorije ili čistog grada).
 */
export function buildSeoCombinedIntroParagraph(parsed: SeoCombinedParsed): string {
  const loc = cityLocative(parsed.cityDisplayName);
  const gen = cityGenitive(parsed.cityDisplayName);
  const d = parsed.categoryDisplayName.toLowerCase();

  const byCategory: Record<string, string> = {
    vodoinstalater: `Ovdje ste ako vam treba vodoinstalaterski rad u ${loc}. Ispod su profili; opišite posao jednom putem zahtjeva — odgovaraju majstori iz ${gen}.`,
    elektricar: `Električar u ${loc}: lista profila ispod. Jedan zahtjev šalje opis majstorima koji rade tu vrstu radova u gradu.`,
    "klima-servis": `Za klimu u ${loc} — montaža, servis, punjenje. Pregledajte profile; zahtjevom isti problem mogu procijeniti zainteresovani majstori.`,
    keramicar: `Keramičar u ${loc}: pločice, kupatila, završni radovi. Jedan zahtjev šalje opis jednom — bez ponavljanja poziva.`,
    stolar: `Stolar u ${loc}: namještaj, vrata, drvo. Profili ispod; u zahtjev unesite mjere i rok ako tražite ponude usporedive po cijeni.`,
    ciscenje: `Čišćenje u ${loc}: birajte profil ili pošaljite jedan zahtjev za površinu i termin.`,
  };

  return (
    byCategory[parsed.categorySlug] ??
    `Stranica za ${d} u ${loc}: pregled majstora u gradu i mogućnost jednog zahtjeva za ${gen}.`
  );
}
