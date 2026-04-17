/**
 * Pojačan sadržaj samo za prioritetne kombinovane SEO rute (money pages).
 * Ne širi se automatski na sve gradove/kategorije.
 */

export const PRIORITY_SEO_LANDING_SLUGS = [
  "vodoinstalater-podgorica",
  "vodoinstalater-niksic",
  "vodoinstalater-budva",
  "elektricar-podgorica",
  "elektricar-niksic",
  "elektricar-budva",
  "klima-servis-podgorica",
  "klima-servis-budva",
  "klima-servis-kotor",
] as const;

export type PrioritySeoLandingSlug = (typeof PRIORITY_SEO_LANDING_SLUGS)[number];

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

const PRIORITY_COPY: Record<PrioritySeoLandingSlug, PrioritySeoLandingContent> = {
  "vodoinstalater-podgorica": {
    intro:
      "U Podgorici su uobičajeni radovi na instalacijama u stanovima i kućama — curenja,zamena sanitarija, bojlera ili cijelih trasa, ponekad i hitno. Ispod su profili majstora u gradu. Umesto da zovete više ljudi redom, možete besplatno objaviti jedan zahtjev: opišite šta curi ili šta ne radi, navedite da li je hitno, po želji dodajte fotografije — zainteresovani majstori šalju ponude, a vi birate.",
    metaTitle: "Vodoinstalater Podgorica — curenja, instalacije, besplatan zahtjev",
    metaDescription:
      "Vodoinstalater u Podgorici: pregled profila za popravke i instalacije. Jedan besplatan zahtjev opišite problem jednom i uporedite ponude — bez obaveze da odmah birate izvođača.",
    ctaTitle: "Jedan zahtjev, više ponuda",
    ctaBody:
      "Objava zahtjeva je besplatna. Napišite šta treba uraditi (curenje, zamjena, hitan kvar), gde je lokacija u gradu i kada vam odgovara dolazak — majstori kojima posao odgovara šalju ponude, bez obaveze prijema.",
    faq: [
      {
        q: "Kako da opišem curenje ili kvar?",
        a: "Napišite gde se vidi voda, da li kaplje stalno ili povremeno, i da li je potrebno hitno reagovanje. Ako imate fotografiju, može pomoći procjeni prije dolaska.",
      },
      {
        q: "Zašto jedan zahtjev umjesto više poziva?",
        a: "Jedan opis ide majstorima koji mogu da prihvate posao u Podgorici — štedite vrijeme i lakše uporedite ponude prije odluke.",
      },
      {
        q: "Šta vidim na profilu majstora?",
        a: "Kategorije koje nudi, ocjene i broj recenzija gde postoje. Na osnovu toga možete odlučiti kome da odgovorite.",
      },
    ],
  },
  "vodoinstalater-niksic": {
    intro:
      "U Nikšiću tražite vodoinstalatera za stan, kuću ili poslovni prostor — od sitnih popravki do zamjene sanitarija ili radova na cijevovodu. Lista profila ispod je za brzi pregled. Ako želite da isti opis vide više majstora i dobijete usporedive ponude, koristite besplatan zahtjev: unesite lokaciju u gradu i kratko šta treba uraditi.",
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
        q: "Mogu li dobiti više ponuda za isti posao?",
        a: "Da — jedan zahtjev ide majstorima koji mogu da odgovore u Nikšiću; vi birate kome da se javite.",
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
      "Vodoinstalater u Budvi: profili za popravke i instalacije. Objavite jedan besplatan zahtjev s opisom i po potrebi fotografijama — uporedite ponude prije angažmana.",
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
        q: "Kako uporediti cijene?",
        a: "Kada stignu ponude, vidite šta je uključeno u procjenu. Na BrziMajstor.ME nema obaveze da prihvatite prvu ponudu.",
      },
    ],
  },
  "elektricar-podgorica": {
    intro:
      "U Podgorici su česti radovi na osiguračima, zamijeni utičnica, rasvjeti, priključenjima i manjim kvarovima u stanovima i poslovnim prostorima. Ispod su profili električara. Ako ne znate uzrok, u zahtjevu opišite šta se dešava (isključuje osigurač, varira svjetlo, miris plastike). Jedan besplatan zahtjev šalje taj opis majstorima u gradu kojima posao odgovara — bez zvanja liste brojeva jedan po jedan.",
    metaTitle: "Električar Podgorica — instalacije, kvarovi, besplatan zahtjev",
    metaDescription:
      "Električar u Podgorici: profili za električne radove i popravke. Objavite jedan besplatan zahtjev s opisom problema i uporedite ponude.",
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
        a: "Isti opis vide majstori koji rade tu vrstu posla u Podgorici — manje ponavljanja za vas, više ponuda za poređenje.",
      },
    ],
  },
  "elektricar-niksic": {
    intro:
      "U Nikšiću električar vam treba za sigurnosnu provjeru instalacije, nove tačke, rasvjetu ili manje kvarove u stanu i kući. Lista profila ispod služi za pregled. Ako želite više ponuda za isti posao, koristite besplatan zahtjev: opišite prostor i šta treba uraditi jednom — odgovaraju majstori iz grada.",
    metaTitle: "Električar Nikšić — stan, kuća, zahtjev bez naknade",
    metaDescription:
      "Električar u Nikšiću: majstori za instalacije i popravke. Besplatno objavite zahtjev, opišite posao i sačekajte ponude.",
    ctaTitle: "Jedan zahtjev za više električara u Nikšiću",
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
        a: "Ne — možete uporediti više ponuda prije odluke.",
      },
    ],
  },
  "elektricar-budva": {
    intro:
      "U Budvi su česti radovi u stanovima i kućama: tabla osigurača, rasvjeta, priključenja, sitni kvarovi prije ili poslije sezone. Pregledajte profile ispod. U zahtjevu navedite da li je objekat u upotrebi ili u uređenju — to pomaže majstoru da procijeni pristup i potreban materijal. Jedan besplatan zahtjev zamjenjuje niz odvojenih poziva.",
    metaTitle: "Električar Budva — stan, kuća, besplatan zahtjev",
    metaDescription:
      "Električar u Budvi: profili za električne radove. Objavite jedan besplatan zahtjev s opisom i uporedite ponude majstora.",
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
      "Klima servis u Podgorici: profili za servis i montažu. Besplatno objavite zahtjev — opišite uređaj i problem, sačekajte ponude i uporedite prije odluke.",
    ctaTitle: "Jedan opis problema, više ponuda za servis klime",
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
        a: "Isti opis vide majstori koji rade servis klime u Podgorici — manje ponavljanja, jasnije poređenje ponuda.",
      },
    ],
  },
  "klima-servis-budva": {
    intro:
      "Na obali su klime u apartmanima i kućama često pod većim opterećenjem u sezoni — redovni servis i čišćenje mogu sprečiti kvarove. U Budvi pregledajte profile ispod. Pre letnje sezone ili kad primetite slabo hlađenje ili buku, jedan besplatan zahtjev može zameniti više poziva: opišite lokaciju u gradu, sprat ako utiče na pristup, i šta klima radi.",
    metaTitle: "Klima servis Budva — apartmani, kuće, zahtjev besplatno",
    metaDescription:
      "Klima servis u Budvi: majstori za servis i montažu. Objavite besplatan zahtjev s opisom uređaja i problema — uporedite ponude.",
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
        q: "Mogu li dobiti više ponuda za isti posao?",
        a: "Da — jedan zahtjev ide majstorima koji mogu da odgovore; vi uporedite prije angažmana.",
      },
    ],
  },
  "klima-servis-kotor": {
    intro:
      "U Kotru su klime u stanovima i kućama često u užim uličnim blokovima ili na više spratova — pristup prostoru i parking ponekad utiču na dolazak majstora. Pregledajte profile ispod. U zahtjevu navedite sprat, lift ako postoji, i šta klima radi (hladi, ne hladi, buka, curenje). Jedan besplatan zahtjev šalje taj opis majstorima koji mogu da odgovore u gradu.",
    metaTitle: "Klima servis Kotor — servis, montaža, besplatan zahtjev",
    metaDescription:
      "Klima servis u Kotru: profili za servis i montažu. Besplatno objavite zahtjev s opisom uređaja i lokacije — uporedite ponude majstora.",
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

export function isPrioritySeoLandingSlug(slug: string): slug is PrioritySeoLandingSlug {
  return slug in PRIORITY_COPY;
}

export function getPrioritySeoLandingContent(slug: string): PrioritySeoLandingContent | null {
  if (!isPrioritySeoLandingSlug(slug)) return null;
  return PRIORITY_COPY[slug];
}
