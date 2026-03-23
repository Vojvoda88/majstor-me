/**
 * Tekstovi za SEO landing stranice (kategorija, grad, kombinovane rute).
 * Isti izvori za <meta> i uvode — bez praznog „SEO spama“ i pretjeranih obećanja.
 */

import { cityGenitive, cityLocative } from "@/lib/slugs";

export function categoryMetaTitle(displayName: string): string {
  return `${displayName} — majstori u Crnoj Gori`;
}

export function categoryMetaDescription(displayName: string): string {
  return `${displayName}: pregled profila u ovoj kategoriji (cijela Crna Gora). Birajte grad filterom, uporedite ocjene ili pošaljite jedan besplatan zahtjev i sačekajte ponude.`;
}

export function gradMetaTitle(cityLocative: string): string {
  return `Majstori u ${cityLocative}`;
}

export function gradMetaDescription(cityLocative: string, cityName: string): string {
  return `Majstori u ${cityLocative} (${cityName}): više kategorija na jednom mjestu — profili sa ocjenama i recenzijama, ili jedan zahtjev za ponude. Nema obaveze da odmah birate izvođača.`;
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
    vodoinstalater: `Vodoinstalater u ${loc}: pregled profila i opcija za besplatan zahtjev. Opišite curenje, zamjenu ili instalaciju — majstori koji mogu da odgovore šalju ponude; možete uporediti prije odluke.`,
    elektricar: `Električar u ${loc} za instalacije, priključenje ili popravke. Profili ispod; ako želite više ponuda, jedan zahtjev ide majstorima iz ${gen} koji rade tu vrstu posla.`,
    "klima-servis": `Klima servis u ${loc}: montaža, punjenje, servis. Pregledajte profile ili objavite zahtjev ako želite više ponuda za isti posao.`,
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
    vodoinstalater: `Ovdje ste ako vam treba vodoinstalaterski rad u ${loc}. Ispod su profili; ako želite da opišete posao jednom i dobijete više ponuda, koristite zahtjev — odgovaraju majstori iz ${gen}.`,
    elektricar: `Električar u ${loc}: lista profila ispod. Za više ponuda odjednom, jedan zahtjev šalje opis majstorima koji rade tu vrstu radova u gradu.`,
    "klima-servis": `Za klimu u ${loc} — montaža, servis, punjenje. Pregledajte profile; zahtjev koristite ako želite da više majstora procijeni isti problem.`,
    keramicar: `Keramičar u ${loc}: pločice, kupatila, završni radovi. Jedan zahtjev pomaže kad želite da više majstora procijeni isti prostor.`,
    stolar: `Stolar u ${loc}: namještaj, vrata, drvo. Profili ispod; u zahtjev unesite mjere i rok ako tražite ponude usporedive po cijeni.`,
    ciscenje: `Čišćenje u ${loc}: birajte profil ili pošaljite jedan zahtjev za površinu i termin.`,
  };

  return (
    byCategory[parsed.categorySlug] ??
    `Stranica za ${d} u ${loc}: pregled majstora u gradu i mogućnost jednog zahtjeva za ${gen}.`
  );
}
