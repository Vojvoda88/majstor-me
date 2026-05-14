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
  return `${parsed.categoryDisplayName} u ${loc} | Pošaljite zahtjev besplatno`;
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
    "pvc-stolarija": `PVC stolarija u ${loc}: prozori, vrata, podešavanje i zamjena okova. Uporedite profile ili pošaljite zahtjev za ponude.`,
    ciscenje: `Čišćenje stanova i poslovnih prostora u ${loc}. Pregledajte profile ili pošaljite zahtjev za procjenu površine i termina.`,
    moler: `Moler u ${loc}: krečenje, gletovanje i priprema zidova. Pogledajte profile i ocjene ili pošaljite jedan zahtjev da dobijete ponude.`,
    bravar: `Bravar u ${loc}: brave, metalni radovi i hitne intervencije. Uporedite profile ili pošaljite zahtjev i sačekajte odgovore majstora.`,
    gipsar: `Gipsar u ${loc}: spušteni plafoni, pregradni zidovi i dekorativni radovi. Profili i ponude na jednom mjestu.`,
    fasader: `Fasader u ${loc} za izolaciju i obnovu fasade. Pregledajte profile ili pošaljite zahtjev sa detaljima objekta.`,
    "grubi-gradjevinski-radovi": `Grubi građevinski radovi u ${loc}: zidanje, betoniranje i konstrukcijski radovi. Pošaljite zahtjev i dobijte ponude izvođača.`,
    selidbe: `Selidbe u ${loc}: stanovi, kancelarije i transport stvari. Pregledajte profile ili pošaljite zahtjev sa relacijom i obimom posla.`,
    bastovanstvo: `Dvorište i bašta u ${loc}: košenje, rezidba, čišćenje i uređenje. Jedan zahtjev vam pomaže da dobijete više ponuda.`,
    "sitni-kucni-poslovi": `Sitni kućni poslovi u ${loc}: montaže i manje popravke u stanu ili kući. Profili majstora i zahtjev za ponude na jednom mjestu.`,
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
    "pvc-stolarija": `PVC stolarija u ${loc}: podešavanje, popravke i zamjene. Pregledajte profile i pošaljite zahtjev sa dimenzijama i tipom otvora.`,
    ciscenje: `Čišćenje u ${loc}: birajte profil ili pošaljite jedan zahtjev za površinu i termin.`,
    moler: `Moler u ${loc}: krečenje, gletovanje i priprema zidova. Ispod su profili; jednim zahtjevom dobijate ponude bez zvanja više brojeva.`,
    bravar: `Bravar u ${loc}: brave, sigurnosna vrata i metalni radovi. Pregledajte profile i pošaljite zahtjev kad želite ponude.`,
    gipsar: `Gipsar u ${loc}: spušteni plafoni i pregradni zidovi. Jedan zahtjev je dovoljan da majstori pošalju odgovore.`,
    fasader: `Fasader u ${loc}: termoizolacija, mrežica i završni sloj. Profili i zahtjev za ponude na jednom mjestu.`,
    "grubi-gradjevinski-radovi": `Grubi građevinski radovi u ${loc}: zidanje, beton, konstrukcija i priprema objekta. Jedan zahtjev šalje opis majstorima u gradu.`,
    selidbe: `Selidbe u ${loc}: stan, kancelarija ili manji transport. Profili su ispod, a zahtjev vam pomaže da uporedite ponude i rokove.`,
    bastovanstvo: `Dvorište i bašta u ${loc}: održavanje zelenih površina, rezidba i uređenje. Jednim zahtjevom dobijate odgovore više majstora.`,
    "sitni-kucni-poslovi": `Sitni kućni poslovi u ${loc}: montaže i popravke koje treba brzo završiti. Pregledajte profile ili pošaljite jedan zahtjev.`,
  };

  return (
    byCategory[parsed.categorySlug] ??
    `Stranica za ${d} u ${loc}: pregled majstora u gradu i mogućnost jednog zahtjeva u ${loc}.`
  );
}

export type SeoLandingFaqItem = { q: string; a: string };

export function buildSeoCombinedFaq(parsed: SeoCombinedParsed): SeoLandingFaqItem[] {
  const loc = cityLocative(parsed.cityDisplayName);
  const service = parsed.categoryDisplayName.toLowerCase();
  return [
    {
      q: "Kako funkcioniše slanje zahtjeva?",
      a: `Otvorite formu, opišete posao za ${service} u ${loc} i pošaljete zahtjev. Majstori kojima odgovara grad i vrsta posla mogu da pošalju odgovor preko platforme.`,
    },
    {
      q: "Da li je objava zahtjeva besplatna?",
      a: "Da. Za korisnika je objava zahtjeva besplatna.",
    },
    {
      q: "Kada se majstori javljaju?",
      a: "Odgovori zavise od dostupnosti majstora. Najčešće pomaže da u zahtjevu napišete okviran termin i što precizniji opis posla.",
    },
    {
      q: "Da li mogu dodati slike problema?",
      a: "Da, kada imate fotografije kvara ili prostora, dodajte ih u zahtjev jer to obično pomaže preciznijoj procjeni.",
    },
    {
      q: "Kako biram majstora?",
      a: "Uporedite odgovore i profile, pa izaberite majstora koji vam najviše odgovara po terminu, pristupu i ponudi.",
    },
    {
      q: "Da li se dogovor obavlja direktno sa majstorom?",
      a: "Da. Nakon povezivanja preko platforme, dalji dogovor oko detalja posla ide direktno sa majstorom.",
    },
  ];
}

export function buildSeoCombinedBodyParagraphs(parsed: SeoCombinedParsed): string[] {
  const loc = cityLocative(parsed.cityDisplayName);
  const gen = cityGenitive(parsed.cityDisplayName);
  const service = parsed.categoryDisplayName.toLowerCase();

  const specifics: Record<string, string> = {
    vodoinstalater: "curenja, zamjene sanitarija, ventila i dijelova instalacije",
    elektricar: "kvarovi na instalacijama, osiguračima, utičnicama i rasvjeti",
    "klima-servis": "servis, čišćenje, provjera rada, montaža i demontaža klima uređaja",
    keramicar: "postavljanje pločica, fugovanje, priprema podloge i završni detalji",
    stolar: "namještaj po mjeri, popravke drvenih elemenata, vrata i okovi",
    "pvc-stolarija": "podešavanje, zamjena okova, dihtovanje i nova PVC stolarija",
    bravar: "brave, cilindri, metalne konstrukcije i intervencije na vratima",
    moler: "krečenje, gletovanje, priprema zidova i završno farbanje",
    gipsar: "spušteni plafoni, pregradni zidovi i dekorativni gipsani elementi",
    fasader: "obnova fasade, termoizolacija i završni fasadni slojevi",
    "grubi-gradjevinski-radovi": "zidanje, betoniranje i grublji konstruktivni zahvati",
    ciscenje: "generalno čišćenje stanova, kuća, lokala i poslovnih prostora",
    selidbe: "lokalne i međugradske selidbe, prenos namještaja i logistika utovara",
    bastovanstvo: "košenje, rezidba, održavanje i uređenje dvorišta i bašte",
    "sitni-kucni-poslovi": "montaže, sitne popravke i kućne intervencije",
  };

  const categorySpecific = specifics[parsed.categorySlug] ?? `${service} poslovi`;

  return [
    `Ako tražite ${service} u ${loc}, najpraktičnije je da posao opišete na jednom mjestu i sačekate odgovore. BrziMajstor.ME nije imenik koji vas tjera da zovete broj po broj. Umjesto toga, jedan zahtjev ide profilima iz ${gen} kojima odgovara i grad i vrsta posla — bilo da su u pitanju majstori ili druge usluge. Tako štedite vrijeme, a i komunikacija ostaje fokusirana na konkretan posao koji želite da završite.`,
    `Za bolji rezultat, u opisu napišite šta tačno treba uraditi, koliki je obim i kada vam okvirno odgovara termin. Kod ove usluge to najčešće znači: ${categorySpecific}. Kada korisnik pošalje jasniji zahtjev, majstor lakše procijeni da li može da preuzme posao i kako da predloži realan naredni korak.`,
    `Objava zahtjeva je besplatna za korisnike. To znači da možete prvo prikupiti odgovore, pa tek onda odlučiti da li vam ponuda i način rada odgovaraju. Platforma povezuje majstore, selidbe, čišćenje i druge usluge u gradu bez nerealnih obećanja i bez pritiska da odmah prihvatite prvo rješenje koje se pojavi.`,
    `Ako imate fotografije, korisno je da ih priložite uz zahtjev. Slika često ubrza razumijevanje problema, posebno kada je teško opisati detalj riječima. Kada majstor vidi kontekst prostora ili kvara, lakše je dati smislen odgovor i dogovoriti dolazak sa manje dodatnih pitanja.`,
    `Na ovoj stranici možete pregledati i profile majstora za ${service} u ${loc}, a zatim otvoriti gradsku ili kategorijsku stranicu za širu pretragu. Bilo da prvo gledate profile ili odmah šaljete zahtjev, cilj je isti: da brzo dođete do majstora koji zaista radi uslugu koja vam treba u vašem gradu.`,
  ];
}
