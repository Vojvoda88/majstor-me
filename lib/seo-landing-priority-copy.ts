/**
 * Pojačan sadržaj samo za prioritetne kombinovane SEO rute (money pages).
 * Sada pokriva prvih 100 service+city kombinacija (automatski),
 * uz ručno napisane override tekstove za najvažnije rute.
 */

import { getCategoryBySlug, PUBLIC_CATEGORY_LISTING } from "@/lib/categories";
import { toLegacyServiceCitySlug } from "@/lib/seo-programmatic-config";
import { CITY_SLUGS, cityGenitive, cityLocative } from "@/lib/slugs";
import { HOMEPAGE_CITIES } from "@/lib/homepage-data";

const AUTO_PRIORITY_LIMIT = 100;

function buildPrioritySlugPool(limit: number): string[] {
  const out: string[] = [];
  // City-first raspored daje bolju pokrivenost svih usluga u glavnim gradovima.
  for (const city of HOMEPAGE_CITIES) {
    if (!CITY_SLUGS[city.slug]) continue;
    for (const cat of PUBLIC_CATEGORY_LISTING) {
      out.push(toLegacyServiceCitySlug(cat.slug, city.slug));
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export const PRIORITY_SEO_LANDING_SLUGS = buildPrioritySlugPool(AUTO_PRIORITY_LIMIT);

export type PrioritySeoLandingSlug = string;

export type PrioritySeoLandingContent = {
  /** Glavni uvod ispod H1 (konkretan, ne copy-paste iz drugog grada). */
  intro: string;
  /** Opciono: <title> osnova (bez „| BrziMajstor.ME“) — ako nedostaje, koristi se generički builder. */
  metaTitle?: string;
  /** Meta description — jedinstvena po ruti. */
  metaDescription: string;
  ctaTitle: string;
  ctaBody: string;
  faq: { q: string; a: string }[];
};

const PRIORITY_COPY: Record<string, PrioritySeoLandingContent> = {
  "vodoinstalater-podgorica": {
    intro:
      "U Podgorici su uobičajeni radovi na instalacijama u stanovima i kućama — curenja,zamena sanitarija, bojlera ili cijelih trasa, ponekad i hitno. Ispod su profili majstora u gradu. Umesto da zovete više ljudi redom, možete besplatno objaviti jedan zahtjev: opišite šta curi ili šta ne radi, navedite da li je hitno, po želji dodajte fotografije — zainteresovani majstori šalju ponude, a vi birate.",
    metaTitle: "Vodoinstalater Podgorica — curenja, instalacije, besplatan zahtjev",
    metaDescription:
      "Vodoinstalater u Podgorici: pregled profila za popravke i instalacije. Jednim besplatnim zahtjevom opišite problem jednom — bez obaveze da odmah birate izvođača.",
    ctaTitle: "Jedan zahtjev — javljaju se majstori kojima odgovara",
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta treba uraditi (curenje, zamjena, hitan kvar), gde je lokacija u gradu i kada vam odgovara dolazak — majstori kojima posao odgovara šalju ponude, bez obaveze prijema.",
    faq: [
      {
        q: "Kako da opišem curenje ili kvar?",
        a: "Napišite gde se vidi voda, da li kaplje stalno ili povremeno, i da li je potrebno hitno reagovanje. Ako imate fotografiju, može pomoći procjeni prije dolaska.",
      },
      {
        q: "Zašto jedan zahtjev umjesto više poziva?",
        a: "Jedan opis ide majstorima koji mogu da prihvate posao u Podgorici — štedite vrijeme i birate kada vam odgovara.",
      },
      {
        q: "Šta vidim na profilu majstora?",
        a: "Kategorije koje nudi, ocjene i broj recenzija gde postoje. Na osnovu toga možete odlučiti kome da odgovorite.",
      },
    ],
  },
  "vodoinstalater-niksic": {
    intro:
      "U Nikšiću tražite vodoinstalatera za stan, kuću ili poslovni prostor — od sitnih popravki do zamjene sanitarija ili radova na cijevovodu. Lista profila ispod je za brzi pregled. Za besplatan zahtjev unesite lokaciju u gradu i kratko šta treba uraditi — zainteresovani majstori se javljaju.",
    metaTitle: "Vodoinstalater Nikšić — stan, kuća, zahtjev bez naknade",
    metaDescription:
      "Vodoinstalater u Nikšiću: majstori za instalacije i popravke. Besplatno objavite zahtjev s opisom posla u gradu i sačekajte ponude — bez obaveze prijema.",
    ctaTitle: "Pošaljite opis posla jednom",
    ctaBody:
      "Nema naplate za objavu zahtjeva. Opišite problem (npr. curenje, zamjena, novi priključak), navedite dio grada ako želite, i sačekajte odgovore — umjesto da zovete redom više brojeva.",
    faq: [
      {
        q: "Šta ako ne znam tačno uzrok?",
        a: "Dovoljno je opisati šta vidite ili čujete (npr. vlažan zid, kap po kap). Majstor može dodatno procijeniti na licu mjesta.",
      },
      {
        q: "Kako funkcioniše jedan zahtjev za isti posao?",
        a: "Jedan zahtjev ide majstorima koji mogu da odgovore u Nikšiću; vi birate kome da se javite.",
      },
      {
        q: "Koliko brzo stiže odgovor?",
        a: "Zavisi od dostupnosti majstora. U zahtjevu navedite željeni termin ili hitnost — to pomaže da se jave oni kojima odgovara.",
      },
    ],
  },
  "vodoinstalater-budva": {
    intro:
      "U Budvi su česti radovi u stanovima, apartmanima i kućama uz more — curenja,zamena instalacija u kuhinji ili kupatilu, bojleri, ponekad radovi između sezona. Pregledajte profile ispod. Ako želite da majstori brže shvate obim posla, u zahtjevu opišite tip objekta (stan, apartman, kuća) i dodajte slike ako pomažu; jedan zahtjev je besplatan i šalje opis svima koji mogu da odgovore.",
    metaTitle: "Vodoinstalater Budva — apartmani, kuće, zahtjev besplatno",
    metaDescription:
      "Vodoinstalater u Budvi: profili za popravke i instalacije. Objavite jedan besplatan zahtjev s opisom i po potrebi fotografijama — javljaju se majstori kojima odgovara.",
    ctaTitle: "Besplatan zahtjev za vodoinstalaterski posao",
    ctaBody:
      "Objava ne košta. Jednim opisom objasnite šta treba (curenje, zamjena, novi element), navedite ako je riječ o apartmanu ili kući, i sačekajte ponude — bez obaveze da prihvatite.",
    faq: [
      {
        q: "Da li treba navesti da li je stan ili kuća?",
        a: "Pomaže: pristup, sprat i tip objekta često utiču na procjenu rada i dolazak alatom.",
      },
      {
        q: "Šta ako je curenje hitno?",
        a: "U zahtjevu jasno napišite da je hitno — majstori kojima to odgovara mogu se javiti brže.",
      },
      {
        q: "Kako procijeniti cijenu?",
        a: "Kada majstor odgovori, vidite šta je uključeno u procjenu. Nema obaveze da nastavite ako vam ne odgovara.",
      },
    ],
  },
  "elektricar-podgorica": {
    intro:
      "U Podgorici su česti radovi na osiguračima, zamijeni utičnica, rasvjeti, priključenjima i manjim kvarovima u stanovima i poslovnim prostorima. Ispod su profili električara. Ako ne znate uzrok, u zahtjevu opišite šta se dešava (isključuje osigurač, varira svjetlo, miris plastike). Jedan besplatan zahtjev šalje taj opis majstorima u gradu kojima posao odgovara — bez zvanja liste brojeva jedan po jedan.",
    metaTitle: "Električar Podgorica — instalacije, kvarovi, besplatan zahtjev",
    metaDescription:
      "Električar u Podgorici: profili za električne radove i popravke. Objavite jedan besplatan zahtjev s opisom problema — javljaju se majstori kojima odgovara.",
    ctaTitle: "Opišite simptom jednom, sačekajte ponude",
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta ne radi ili šta treba povezati, gde u gradu i kada vam odgovara dolazak. Majstori odgovaraju ako mogu preuzeti posao — vi birate kome da se javite.",
    faq: [
      {
        q: "Šta ako iskaču osigurači?",
        a: "Napišite koliko često i šta je uključeno u trenutku kada iskoči — to pomaže procjeni da li je potrebna detaljnija provjera instalacije.",
      },
      {
        q: "Mogu li tražiti samo zamjenu utičnica ili rasvjetu?",
        a: "Da. U zahtjevu navedite vrstu radova; majstori daju ponudu prema opisu.",
      },
      {
        q: "Zašto jedan zahtjev umjesto više poziva?",
        a: "Isti opis vide majstori koji rade tu vrstu posla u Podgorici — manje ponavljanja za vas i brži odgovor.",
      },
    ],
  },
  "elektricar-niksic": {
    intro:
      "U Nikšiću električar vam treba za sigurnosnu provjeru instalacije, nove tačke, rasvjetu ili manje kvarove u stanu i kući. Lista profila ispod služi za pregled. Za besplatan zahtjev opišite prostor i šta treba uraditi jednom — odgovaraju majstori iz grada.",
    metaTitle: "Električar Nikšić — stan, kuća, zahtjev bez naknade",
    metaDescription:
      "Električar u Nikšiću: majstori za instalacije i popravke. Besplatno objavite zahtjev, opišite posao i sačekajte ponude.",
    ctaTitle: "Jedan zahtjev za električare u Nikšiću",
    ctaBody:
      "Nema naknade za objavu. Jednim opisom navedite šta treba (npr. nova utičnica, kvar, rasvjeta) i termin — javljaju se majstori kojima odgovara posao.",
    faq: [
      {
        q: "Kako da opišem posao ako nisam stručnjak?",
        a: "Dovoljno je svakodnevni opis: šta ne radi, gde u stanu/kući, i da li je bilo skorijih radova.",
      },
      {
        q: "Mogu li videti iskustvo majstora prije kontakta?",
        a: "Na profilu su kategorije i, gde postoje, ocjene od ranijih korisnika.",
      },
      {
        q: "Da li moram odmah prihvatiti ponudu?",
        a: "Ne — birate kada i s kim nastavljate razgovor.",
      },
    ],
  },
  "elektricar-budva": {
    intro:
      "U Budvi su česti radovi u stanovima i kućama: tabla osigurača, rasvjeta, priključenja, sitni kvarovi prije ili poslije sezone. Pregledajte profile ispod. U zahtjevu navedite da li je objekat u upotrebi ili u uređenju — to pomaže majstoru da procijeni pristup i potreban materijal. Jedan besplatan zahtjev zamjenjuje niz odvojenih poziva.",
    metaTitle: "Električar Budva — stan, kuća, besplatan zahtjev",
    metaDescription:
      "Električar u Budvi: profili za električne radove. Objavite jedan besplatan zahtjev s opisom — javljaju se majstori kojima odgovara.",
    ctaTitle: "Besplatna objava zahtjeva za električne radove",
    ctaBody:
      "Objava ne košta. Opišite šta treba uraditi u Budvi, navedite ako je hitno ili ako treba dogovor oko termina — majstori šalju ponude, vi birate.",
    faq: [
      {
        q: "Šta ako radovi trebaju u apartmanu za izdavanje?",
        a: "Navedite u zahtjevu željeni termin i pristup — majstori mogu predložiti dolazak kada vama odgovara.",
      },
      {
        q: "Mogu li tražiti provjeru cijele instalacije?",
        a: "Da — u opisu navedite da želite pregled stanja instalacije ili sigurnosnu provjeru.",
      },
      {
        q: "Kako funkcionišu ponude?",
        a: "Nakon zahtjeva majstori mogu poslati ponude; vi odlučujete s kim nastavljate razgovor.",
      },
    ],
  },
  "klima-servis-podgorica": {
    intro:
      "U Podgorici klima uređaj često treba servis, čišćenje filtera, provjeru pritiska i rada, ponekad i montažu ili demontažu. Ispod su profili majstora za klimu. Ako želite ponude bez obilaska telefonske liste, objavite jedan besplatan zahtjev: navedite marku ako znate, da li klima hladi ili ne, i prostoriju (npr. dnevni boravak, poslovni prostor). Majstori kojima posao odgovara javljaju se s ponudama.",
    metaTitle: "Klima servis Podgorica — montaža, servis, besplatan zahtjev",
    metaDescription:
      "Klima servis u Podgorici: profili za servis i montažu. Besplatno objavite zahtjev — opišite uređaj i problem; javljaju se majstori kojima odgovara.",
    ctaTitle: "Jedan opis problema — servis klime u Podgorici",
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta klima radi ili ne radi, gde je ugradnja i kada vam odgovara dolazak — odgovaraju majstori iz Podgorice šalju ponude; nema obaveze prijema.",
    faq: [
      {
        q: "Šta navesti ako ne znam tačan model klime?",
        a: "Napišite šta vidite na uređaju ili uputite fotografiju naljepnice — ako znate marku i godinu, dodajte i to.",
      },
      {
        q: "Da li zahtjev pokriva i punjenje gasa?",
        a: "U opisu navedite ako sumnjate na nedostatak hladnog medija ili slabo hlađenje; majstor procenjuje šta je potrebno.",
      },
      {
        q: "Zašto jedan zahtjev umjesto više poziva?",
        a: "Isti opis vide majstori koji rade servis klime u Podgorici — manje ponavljanja i jasniji odgovori.",
      },
    ],
  },
  "klima-servis-budva": {
    intro:
      "Na obali su klime u apartmanima i kućama često pod većim opterećenjem u sezoni — redovni servis i čišćenje mogu sprečiti kvarove. U Budvi pregledajte profile ispod. Pre letnje sezone ili kad primetite slabo hlađenje ili buku, jedan besplatan zahtjev može zameniti više poziva: opišite lokaciju u gradu, sprat ako utiče na pristup, i šta klima radi.",
    metaTitle: "Klima servis Budva — apartmani, kuće, zahtjev besplatno",
    metaDescription:
      "Klima servis u Budvi: majstori za servis i montažu. Objavite besplatan zahtjev s opisom uređaja i problema — javljaju se majstori kojima odgovara.",
    ctaTitle: "Besplatan zahtjev za servis ili provjeru klime",
    ctaBody:
      "Nema naknade za objavu. Jednim opisom navedite šta treba (servis, čišćenje, slabo hlađenje), lokaciju u Budvi i termin — majstori šalju ponude, vi birate.",
    faq: [
      {
        q: "Šta ako je klima u apartmanu za izdavanje?",
        a: "Navedite željeni termin i način pristupa — majstori mogu predložiti dolazak kada objekat može biti otvoren.",
      },
      {
        q: "Kako da opišem problem ako samo „ne hladi dobro“?",
        a: "Napišite koliko dugo radi, da li curi voda, da li ima neobičan zvuk ili miris — to pomaže procjeni prije dolaska.",
      },
      {
        q: "Kako funkcioniše jedan zahtjev za isti posao?",
        a: "Jedan zahtjev ide majstorima koji mogu da odgovore; vi birate s kim nastavljate.",
      },
    ],
  },
  "klima-servis-kotor": {
    intro:
      "U Kotru su klime u stanovima i kućama često u užim uličnim blokovima ili na više spratova — pristup prostoru i parking ponekad utiču na dolazak majstora. Pregledajte profile ispod. U zahtjevu navedite sprat, lift ako postoji, i šta klima radi (hladi, ne hladi, buka, curenje). Jedan besplatan zahtjev šalje taj opis majstorima koji mogu da odgovore u gradu.",
    metaTitle: "Klima servis Kotor — servis, montaža, besplatan zahtjev",
    metaDescription:
      "Klima servis u Kotru: profili za servis i montažu. Besplatno objavite zahtjev s opisom uređaja i lokacije — javljaju se majstori kojima odgovara.",
    ctaTitle: "Opišite klima uređaj i pristup prostoru jednom",
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta treba (servis, montaža, slabo hlađenje), lokaciju u Kotru i ako je bitno — sprat ili pristup. Majstori šalju ponude; nema obaveze da prihvatite.",
    faq: [
      {
        q: "Zašto je važno navesti sprat i pristup?",
        a: "U starijim blokovima ili užim ulicama dolazak sa alatom zavisi od pristupa — jasna napomena smanjuje nejasnoće oko termina.",
      },
      {
        q: "Šta ako ne znam da li treba punjenje?",
        a: "Opišite simptome (slabo hlađenje, led na unutrašnjoj jedinici); majstor procjenjuje na licu mjesta.",
      },
      {
        q: "Kako funkcioniše besplatan zahtjev?",
        a: "Jedan opis ide majstorima koji mogu da prihvate posao u Kotru; vi birate s kim nastavljate.",
      },
    ],
  },
};

const PRIORITY_SET = new Set([...PRIORITY_SEO_LANDING_SLUGS, ...Object.keys(PRIORITY_COPY)]);
const CITY_SLUG_KEYS_DESC = Object.keys(CITY_SLUGS).sort((a, b) => b.length - a.length);

type ParsedLegacySlug = {
  categorySlug: string;
  citySlug: string;
  cityName: string;
  categoryDisplayName: string;
};

function parseLegacyPrioritySlug(slug: string): ParsedLegacySlug | null {
  for (const citySlug of CITY_SLUG_KEYS_DESC) {
    if (!slug.endsWith(`-${citySlug}`)) continue;
    const categorySlug = slug.slice(0, -1 * (`-${citySlug}`.length));
    if (!categorySlug) continue;
    const cat = getCategoryBySlug(categorySlug);
    if (!cat?.publicListing) continue;
    const cityName = CITY_SLUGS[citySlug];
    if (!cityName) continue;
    return {
      categorySlug,
      citySlug,
      cityName,
      categoryDisplayName: cat.displayName,
    };
  }
  return null;
}

function autoFaq(displayName: string, cityLoc: string): { q: string; a: string }[] {
  return [
    {
      q: `Koliko košta ${displayName.toLowerCase()} u ${cityLoc}?`,
      a: "Cijena zavisi od obima posla, materijala i termina. Nakon zahtjeva možete uporediti više ponuda i izabrati ono što vam odgovara.",
    },
    {
      q: "Kako da napišem dobar zahtjev?",
      a: "Navedite šta tačno treba uraditi, gdje je lokacija i kada vam odgovara dolazak. Jasniji opis obično donosi preciznije ponude.",
    },
    {
      q: "Da li moram odmah prihvatiti ponudu?",
      a: "Ne. Zahtjev je besplatan, ponude možete uporediti i tek onda odlučiti da li i s kim želite da nastavite.",
    },
  ];
}

function buildAutoPriorityContent(parsed: ParsedLegacySlug): PrioritySeoLandingContent {
  const loc = cityLocative(parsed.cityName);
  const gen = cityGenitive(parsed.cityName);
  const display = parsed.categoryDisplayName;
  const d = display.toLowerCase();

  const categoryAngle: Record<string, string> = {
    vodoinstalater: "curenja, instalacije i hitne intervencije",
    elektricar: "kvarovi, osigurači i električne instalacije",
    "klima-servis": "servis, čišćenje i montaža klima uređaja",
    keramicar: "pločice, kupatila i završni keramičarski radovi",
    stolar: "namještaj, vrata i stolarski radovi po mjeri",
    "pvc-stolarija": "prozori, vrata i podešavanje PVC stolarije",
    bravar: "brave, sigurnost i metalni bravarski radovi",
    moler: "krečenje, gletovanje i priprema zidova",
    gipsar: "spušteni plafoni i gipsani sistemi",
    fasader: "fasada i termoizolacioni radovi",
    "grubi-gradjevinski-radovi": "zidanje, betoniranje i grubi građevinski radovi",
    ciscenje: "čišćenje stanova, lokala i poslovnih prostora",
    selidbe: "selidbe i transport stvari",
    bastovanstvo: "uređenje i održavanje dvorišta i bašte",
    "sitni-kucni-poslovi": "sitne popravke i kućne intervencije",
  };

  const angle = categoryAngle[parsed.categorySlug] ?? `${d} usluge`;

  return {
    intro: `${display} u ${loc}: ${angle}. Ispod su profili majstora u gradu. Ako želite ponude bez zvanja više brojeva, pošaljite jedan besplatan zahtjev i sačekajte odgovore majstora iz ${gen}.`,
    metaTitle: `${display} ${parsed.cityName} — profili i besplatan zahtjev`,
    metaDescription: `${display} u ${loc}: pregled profila i jedan besplatan zahtjev za ponude majstora iz ${gen}. Bez obaveze da odmah izaberete izvođača.`,
    ctaTitle: `Pošaljite zahtjev za ${d} u ${loc}`,
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta treba uraditi, lokaciju i željeni termin — majstori kojima posao odgovara mogu poslati ponudu, a vi birate da li i s kim nastavljate.",
    faq: autoFaq(display, loc),
  };
}

export function isPrioritySeoLandingSlug(slug: string): slug is PrioritySeoLandingSlug {
  return PRIORITY_SET.has(slug);
}

export function getPrioritySeoLandingContent(slug: string): PrioritySeoLandingContent | null {
  const manual = PRIORITY_COPY[slug];
  if (manual) return manual;
  if (!isPrioritySeoLandingSlug(slug)) return null;
  const parsed = parseLegacyPrioritySlug(slug);
  if (!parsed) return null;
  return buildAutoPriorityContent(parsed);
}
