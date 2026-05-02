/**
 * Long-tail SEO: /problemi/{problem}-{citySlug}
 * Jedinstven sadržaj po problemu; grad se uklapa u tekst i meta.
 */

import { HOMEPAGE_CITIES } from "@/lib/homepage-data";
import { CITY_SLUGS } from "@/lib/slugs";

export type ProblemSeoDef = {
  slug: string;
  /** Javni slug kategorije za interni link /{slug}/{city} */
  relatedServiceSlug: string;
  metaTitle: (cityNom: string) => string;
  metaDescription: (cityLoc: string, cityNom: string) => string;
  /** Uvod ~100–150 riječi */
  intro: (cityLoc: string, cityNom: string) => string;
  causes: string[];
  faqs: { q: string; a: string }[];
};

export const SEO_PROBLEMS: ProblemSeoDef[] = [
  {
    slug: "curi-voda",
    relatedServiceSlug: "vodoinstalater",
    metaTitle: (c) => `Curenje vode ${c} — majstor, uzrok, šta uraditi | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Curenje vode ${loc}: česti uzroci (slavina, cijev, bojler). Jednim zahtjevom na BrziMajstor.ME dobijate ponude majstora iz ${nom} i okoline — bez obaveze.`,
    intro: (loc, nom) =>
      `Curenje vode ${loc} je jedan od najčešćih kućnih problema: ponekad je riječ o labavoj spojnice ispod sudopere, ponekad o staroj trasi ili pritisku u instalaciji. Voda može da napadi zid, pod ili ormariće — zato je važno brzo locirati izvor i smanjiti štetu dok ne stigne majstor. Na BrziMajstor.ME možete besplatno objaviti zahtjev: opišite gdje primjećujete tragove, da li kaplje stalno ili samo kad koristite vodu, i ako možete dodajte fotografiju. Majstori vodoinstalateri iz ${nom} i okoline koji mogu da odgovore šalju ponude; vi birate termin i način dogovora.`,
    causes: [
      "dotrajali gumeni zaptivači i ventili",
      "labav spoj na fleks cijevi ili „američkom“ ventilu",
      "pritisak u instalaciji ili taloženje u bojleru",
      "pukotina na odvodu ili loše zaptivena prolaz kroz zid",
    ],
    faqs: [
      {
        q: "Šta prvo uraditi kod curenja?",
        a: "Ako znate gdje je ventil, zatvorite vodu za tu granu. Sušite tragove da majstor lakše pronađe izvor — fotografija u zahtjevu pomaže procjeni.",
      },
      {
        q: "Mogu li dobiti više ponuda?",
        a: "Da. Jedan opis zahtjeva vide majstori kojima posao odgovara — poređajte cijenu i rok.",
      },
    ],
  },
  {
    slug: "nema-struje",
    relatedServiceSlug: "elektricar",
    metaTitle: (c) => `Nema struje ${c} — osigurači, fazni nedostatak | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Nestanak struje ${loc}: provjera osigurača, fazni problem ili kvar na instalaciji. Objavite zahtjev — električari iz ${nom} šalju ponude.`,
    intro: (loc, nom) =>
      `Kad „nema struje“ ${loc}, prvo provjerite da li je ispala grupa na tabli ili cijeli stub. Ako susjedi imaju struju, problem je često u stanu: osigurač, dodir faznog i neutralnog, ili kvar na jednoj grani (npr. bojler, klima). Samoinstalacije bez licenciranog majstora nose rizik — posebno kod starijih tabli. Objavite zahtjev na BrziMajstor.ME: opišite šta radi prije nestanka (radila klima, šporet…), koji dio stana je bez napajanja i kada treba dolazak. Električari iz ${nom} vide zahtjev i šalju ponude.`,
    causes: [
      "ispala grupa ili osigurač zbog preopterećenja",
      "labav kontakt u utičnici ili utičnica dotrajala",
      "kvar na bojleru / klasi koja vuče punu struju",
      "greška na glavnoj tabli ili starim bakarnim vezama",
    ],
    faqs: [
      {
        q: "Da li moram imati procjenu prije dolaska?",
        a: "U zahtjevu opišite simptome — majstar može procijeniti da li je potreban izlazak na teren odmah ili poslije provjere.",
      },
      {
        q: "Ko plaća materijal?",
        a: "Dogovarate direktno s majstorom — u ponuci često piše šta je uključeno.",
      },
    ],
  },
  {
    slug: "pokvaren-bojler",
    relatedServiceSlug: "vodoinstalater",
    metaTitle: (c) => `Pokvaren bojler ${c} — nema tople vode, curenje | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Bojler ne grije ili curi ${loc}. Objavite zahtjev za vodoinstalatera u ${nom} — ponude za popravku ili zamjenu.`,
    intro: (loc, nom) =>
      `Bojler koji ne grije, šušti, curi ili gasi osigurač traži brzu procjenu: ponekad je dovoljna zamjena grijača ili termostata, ponekad je bolja zamjena uređaja. Nemojte sami otvarati pod pritiskom — rizik od opeklina i prosipa vode. Na BrziMajstor.ME opišite marku, starost bojlera, šta tačno ne radi i gdje se nalazi. Vodoinstalateri iz ${nom} i okoline šalju ponude i dogovaraju termin.`,
    causes: [
      "dotrajao grijač ili termostat",
      "kamenca i loš protok zbog zasluženog kesa",
      "curenje na spojevima ili sigurnosni ventil",
      "slab pritisak vode ili električni problem na grani",
    ],
    faqs: [
      {
        q: "Popravka ili novi bojler?",
        a: "Zavisi od starosti i cijene dijela. Majstar u ponudi često napiše obje opcije.",
      },
      {
        q: "Koliko brzo mogu dobiti dolazak?",
        a: "U zahtjevu navedite hitnost — majstori odgovaraju kad mogu, posebno za toplu vodu.",
      },
    ],
  },
  {
    slug: "klima-ne-hladi",
    relatedServiceSlug: "klima-servis",
    metaTitle: (c) => `Klima ne hladi ${c} — servis, pritisak, filter | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Klima slabo hladi ili smrdi ${loc}. Servis klime u ${nom}: jedan zahtjev, više ponuda majstora.`,
    intro: (loc, nom) =>
      `Klima koja „radi“ ali ne rashlađuje dovoljno često traži servis: filter, pritisak plina, ili čišćenje isparivača. Na obali i u gradu sezone opterećuju uređaje — redovno čišćenje produžava vijek. Objavite zahtjev: marka, godina, da li hladi uopšte i da li ima led ili buku. Majstori za klimu ${nom} šalju ponude za pregled i servis.`,
    causes: [
      "prljav ili zapušen filter",
      "nizak pritisak rashladnog fluida",
      "elektronski problem ili senzor",
      "prljav isparivač / kondenz na odvodu",
    ],
    faqs: [
      {
        q: "Da li servis uključuje dopunu gasa?",
        a: "To zavisi od stanja uređaja; majstar treba da izmjeri pritisak prije dopune.",
      },
      {
        q: "Koliko traje servis?",
        a: "Često jedan dolazak; ako treba dijelovi, dogovorite drugi termin.",
      },
    ],
  },
  {
    slug: "upali-osiguraci",
    relatedServiceSlug: "elektricar",
    metaTitle: (c) => `Upadaju osigurači ${c} — električar, uzrok | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Osigurač stalno ispad ${loc}. Električar ${nom}: sigurna dijagnostika i ponude putem BrziMajstor.ME.`,
    intro: (loc, nom) =>
      `Ako osigurač ispadne više puta, ne zamenjujte ga „jačim“ bez provjere — tražite uzrok na potrošaču ili instalaciji. Kratak spoj, dotrajala utičnica ili kućište uređaja mogu da vuče previše struje. Objavite zahtjev i navedite koja grupa ispadne i šta ste uključili prije toga. Električari ${nom} šalju ponude za izlazak i sanaciju.`,
    causes: [
      "preopterećenje jedne grane",
      "dotrajala utičnica ili fleks",
      "kvar na bojleru, klima ili šporetu",
      "vlaga u kutiji ili slab kontakt",
    ],
    faqs: [
      {
        q: "Mogu li privremeno podići osigurač?",
        a: "Može biti opasno ako postoji kratki spoj — bolje prepustiti majstoru.",
      },
      {
        q: "Šta ako ispada cijela tabla?",
        a: "Navedite u zahtjevu — možda je problem iznad stana ili kod operatora.",
      },
    ],
  },
  {
    slug: "vlaga-na-zidu",
    relatedServiceSlug: "fasader",
    metaTitle: (c) => `Vlaga na zidu ${c} — procjena, sanacija | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Mrlje i vlaga na zidu ${loc}. Fasader / izolacija ${nom}: zahtjev sa opisom zida i strane objekta.`,
    intro: (loc, nom) =>
      `Vlaga na unutrašnjem zidu može biti od kondenza, prodora kiše ili kapilarne vlage. Bez pregleda spolja i iznutra lako je pogrešno „zakrpiti“ simptom. Objavite zahtjev: sprat, strana stana prema ulici/dvorištu, koliko dugo traje i da li je zid hladan. Majstori za fasade i sanaciju ${nom} mogu predložiti dijagnostiku i radove.`,
    causes: [
      "mostična toplota — kondenz na hladnom zidu",
      "pukotina u spoljnoj završnoj oblozi",
      "loša ventilacija u kupatilu",
      "kapilarna vlaga u starijim zidovima",
    ],
    faqs: [
      {
        q: "Da li treba skeniranje zida?",
        a: "Ponekad da; majstor predlaže nakon prvog pregleda.",
      },
      {
        q: "Ko radi unutra, ko spolja?",
        a: "Zavisi od uzroka — u ponudi je jasno šta je obuhvaćeno.",
      },
    ],
  },
  {
    slug: "pukla-plocica",
    relatedServiceSlug: "keramicar",
    metaTitle: (c) => `Pukla pločica ${c} — zamjena, keramičar | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Pukotine u keramici, fugovanje ${loc}. Keramičar ${nom} — ponude za popravku ili zamjenu.`,
    intro: (loc, nom) =>
      `Pukla pločica u kupatilu ili kuhinji može dovesti do prodora vode ispod keramike — posebno ako je pukotina uz odvod ili zid tuš kabine. Keramičar može zamijeniti komade, preseći liniju ili predložiti veću obnovu ako je fug masa dotrajala. Objavite zahtjev sa fotografijom i kvadraturom. Keramičari ${nom} šalju ponude.`,
    causes: [
      "udar ili pomeranje podloge",
      "dotrajala fuga i prodor vode",
      "loše prianjanje ljepila pri starijim radovima",
    ],
    faqs: [
      {
        q: "Imam li rezervne pločice?",
        a: "Ako imate — navedite; ako ne, majstor predlaže zamjenu najbližom nijansom.",
      },
      {
        q: "Koliko traje sušenje?",
        a: "Zavisi od ljepila i prostora — u ponudi piše okvirni rok.",
      },
    ],
  },
  {
    slug: "zapusen-odvod",
    relatedServiceSlug: "vodoinstalater",
    metaTitle: (c) => `Zapušen odvod ${c} — sudopera, kupatilo | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Odvod ne povlači, miris ${loc}. Vodoinstalater ${nom} — mašinsko čišćenje ili rušenje zapušenja.`,
    intro: (loc, nom) =>
      `Zapušen sudoper ili tuš sporo povlači vodu i širi neprijatan miris. Kućni hemijski preparati ponekad pogoršaju situaciju kod starijih cijevi. Bolje je majstoru opisati gdje je zapušenje i kada je počelo. Vodoinstalateri ${nom} nude čišćenje spiralom, hidraulički pritisak ili rasklapanje sifona — prema situaciji.`,
    causes: [
      "masnoća i ostaci hrane u kuhinjskoj grani",
      "kosa i sapun u kupatilu",
      "nanos u horizontalnim dionicama",
    ],
    faqs: [
      {
        q: "Da li hemija pomaže?",
        a: "Ponekad privremeno; kod tvrdog zapušenja treba mehaničko čišćenje.",
      },
      {
        q: "Ko čisti glavni vertikal?",
        a: "Zajednički stub često angažuje upravu — u kući je individualno.",
      },
    ],
  },
  {
    slug: "slab-pritisak-vode",
    relatedServiceSlug: "vodoinstalater",
    metaTitle: (c) => `Slab pritisak vode ${c} — slavina, cijev | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Voda kaplje umjesto da lijeće ${loc}. Vodoinstalater ${nom}: dijagnostika pritiska i filtera.`,
    intro: (loc, nom) =>
      `Slab pritisak može biti samo na jednoj slavini ili u cijelom stanu: razlikujemo problem na aeratoru, ventilu ili u magistrali. Ako je slab pritisak „svuda“, možda je reduktor, filter ili radovi na mreži u gradu. Objavite zahtjev i opišite sprat i vrijeme pojave. Majstori ${nom} provjeravaju preporučeni redoslijed uzrokovanja.`,
    causes: [
      "zaprljan aerator ili ventil",
      "filter ili reduktor pritiska",
      "gušenje na magistrali ili staroj cijevi",
    ],
    faqs: [
      {
        q: "Da li je to hitno?",
        a: "Ako je pritisak naglo pao u cijelom stanu, provjerite sa komšijama i javite majstoru.",
      },
      {
        q: "Trebam li novi reduktor?",
        a: "Zavisi od mjerenja — majstor donosi preporuku.",
      },
    ],
  },
  {
    slug: "krecenje-stana",
    relatedServiceSlug: "moler",
    metaTitle: (c) => `Krečenje stana ${c} — cijena, priprema | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Krečenje stana ili sobe ${loc}. Moler ${nom}: ponude za pripremu zidova i boju.`,
    intro: (loc, nom) =>
      `Prije krečenja često treba kitovanje pukotina, toniranje fleka i zaštita poda. Veći stanovi traže plan po sobama i boji. Objavite kvadraturu, visinu plafona, da li su zidovi gips ili beton i željeni rok. Moleri ${nom} šalju ponude i mogu predložiti obilazak za precizniju procjenu.`,
    causes: [],
    faqs: [
      {
        q: "Šta je uključeno u cijenu?",
        a: "U ponuci piše materijal, priprema i broj premaza.",
      },
      {
        q: "Moram li isprazniti prostor?",
        a: "Dogovorite — većina timova traži pomeranje sitnog namještaja od zida.",
      },
    ],
  },
  {
    slug: "spust-plafon",
    relatedServiceSlug: "gipsar",
    metaTitle: (c) => `Spušteni plafon ${c} — gips, LED | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Spušteni plafon, pregrade od gipsa ${loc}. Gipsar ${nom} — ponude za mjerenje i ugradnju.`,
    intro: (loc, nom) =>
      `Spušteni plafoni sakrivaju instalacije i omogućavaju LED trake. Važno je tačno dimenzionisanje i mostovi kad nose lustere. Objavite kvadraturu soba i želite li klasičan ram ili više nivoa. Gipsari ${nom} šalju ponude za materijal i rad.`,
    causes: [],
    faqs: [
      {
        q: "Koliko gubi visinu prostor?",
        a: "Zavisi od profila — obično 8–12 cm sa izolacijom.",
      },
      {
        q: "Ko projektuje rasvjetu?",
        a: "Dogovor sa majstorom ili električarem za pozicije kablova.",
      },
    ],
  },
  {
    slug: "generalno-ciscenje",
    relatedServiceSlug: "ciscenje",
    metaTitle: (c) => `Generalno čišćenje ${c} — stan, poslovni prostor | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Generalno čišćenje stana ${loc}. Timovi za čišćenje ${nom}: ponude po kvadraturi.`,
    intro: (loc, nom) =>
      `Generalno čišćenje pred praznike ili useljenje obuhvata kupatilo, kuhinju, podove i prašinu na tvrdim površinama. Objavite kvadraturu, broj soba, da li treba prozori i željeni dan. Agencije i timovi ${nom} šalju ponude sa procijenjenim trajanjem.`,
    causes: [],
    faqs: [
      {
        q: "Da li donose sredstva?",
        a: "Većina da — potvrdite u zahtjevu ako imate alergije.",
      },
      {
        q: "Koliko ljudi dolazi?",
        a: "Zavisi od kvadrature — u ponudi piše okvir.",
      },
    ],
  },
  {
    slug: "selidba-stana",
    relatedServiceSlug: "selidbe",
    metaTitle: (c) => `Selidba stana ${c} — kombi, tim, kutije | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Selidba stana ili porodične kuće ${loc}. Selidbe ${nom}: ponude za prevoz i nošenje.`,
    intro: (loc, nom) =>
      `Selidba traži plan: spratovi, lift, dužina kombija i zaštita namještaja. Objavite relacije (od–do), procijenjeni volumen i datum. Timovi za selidbe ${nom} šalju ponude sa satima rada i kilometražom.`,
    causes: [],
    faqs: [
      {
        q: "Ko pakuje stvari?",
        a: "Dogovor — može samo prevoz ili komplet sa kutijama.",
      },
      {
        q: "Šta sa starim namještajem?",
        a: "Neki nude odvoz na deponiju uz doplatu.",
      },
    ],
  },
  {
    slug: "kosnja-trave",
    relatedServiceSlug: "bastovanstvo",
    metaTitle: (c) => `Košnja trave, održavanje dvorišta ${c} | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Košnja, rezidba, bašta ${loc}. Baštovan ${nom} — sezonsko održavanje.`,
    intro: (loc, nom) =>
      `Redovna košnja i rezidba čuvaju travnjak i smanjuju alergene u sezoni. Objavite površinu dvorišta, nagib i da li treba odvoz zelenog otpada. Baštovani ${nom} šalju ponude za jednokratno ili više posjeta.`,
    causes: [],
    faqs: [
      {
        q: "Da li uključuje trimovanje ivica?",
        a: "Dogovorite u zahtjevu — često kao dodatak.",
      },
      {
        q: "Sezonsko održavanje?",
        a: "Možete ugovoriti više dolazaka tokom ljeta.",
      },
    ],
  },
  {
    slug: "zamena-brave",
    relatedServiceSlug: "bravar",
    metaTitle: (c) => `Zamjena brave, cilindra ${c} — bravar | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Zaglavila vrata, nova brava ${loc}. Bravar ${nom}: hitne i planirane intervencije.`,
    intro: (loc, nom) =>
      `Zaglavljena ili dotrajala brava na ulaznim vratima traži stručnjaka da ne ošteti okvir. Objavite tip brave (standard, multipoint) i da li treba cilindar sa više ključeva. Bravari ${nom} šalju ponude za izlazak i zamjenu.`,
    causes: [
      "dotajan cilindar ili ključ",
      "pomeranje okvira zbog vlage",
      "pokušaj provale ili oštećenje brave",
    ],
    faqs: [
      {
        q: "Hitno otvaranje?",
        a: "Navedite u zahtjevu — većina nudi brzu intervenciju uz doplatu.",
      },
      {
        q: "Wawa ili standard?",
        a: "Opišite vrata — majstar predlaže kompatibilnu bravu.",
      },
    ],
  },
  {
    slug: "pvc-prozor-zrak",
    relatedServiceSlug: "pvc-stolarija",
    metaTitle: (c) => `PVC prozor pušta zrak ${c} — podešavanje, dihtung | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Prozor curi hladnoću, kondenz ${loc}. PVC stolarija ${nom}: dihtovanje i popravka šarki.`,
    intro: (loc, nom) =>
      `Prozor koji pušta zrak povećava račun grijanja i stvara kondenz. Često je dovoljno podešavanje šarki i zamjena dihtunga — bez zamjene cijelog krila. Objavite broj krila, sprat i godinu ugradnje. Stolari za PVC ${nom} šalju ponude.`,
    causes: [
      "dotrajali dihtung",
      "labave šarke poslije godina",
      "loše zaptivanje kod montaže",
    ],
    faqs: [
      {
        q: "Da li se može na licu mjesta?",
        a: "Često da za dihtung i šarke; staklo zahtijeva mjerenje.",
      },
      {
        q: "Kondenz između stakala?",
        a: "Dvostruko staklo sa rosom unutra obično traži zamjenu staklopaka.",
      },
    ],
  },
  {
    slug: "montaza-namestaja",
    relatedServiceSlug: "stolar",
    metaTitle: (c) => `Montaža namještaja ${c} — kuhinja, ormari | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Montaža kuhinje i namještaja ${loc}. Stolar ${nom}: ponude za sklapanje i podešavanje.`,
    intro: (loc, nom) =>
      `Kuhinjske elemente i ormare treba montirati tačno — voditi računa o nivou i vezi za zid. Objavite marku ili veličinu seta i da li su elementi već u stanu. Stolari ${nom} šalju ponude za montažu i rupe za tehniku.`,
    causes: [],
    faqs: [
      {
        q: "Šta ako fali jedan element?",
        a: "Kontaktirajte prodavca — majstor montira kada komplet stigne.",
      },
      {
        q: "Veza za zid za teške elemente?",
        a: "Dogovor za bušenje i tiplove u ciglu/gipsu.",
      },
    ],
  },
  {
    slug: "hitna-intervencija-voda",
    relatedServiceSlug: "vodoinstalater",
    metaTitle: (c) => `Hitno curenje vode ${c} — 24h vodoinstalater | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Veliko curenje, potop ${loc}. Vodoinstalateri ${nom}: opišite hitnost u zahtjevu.`,
    intro: (loc, nom) =>
      `Hitno curenje zahteva zatvaranje glavnog ventila i suzbijanje štete krpama. Poslije toga treba majstor da locira pukotinu. Objavite broj telefona za kontakt i da li je potrebna intervencija danas. Vodoinstalateri ${nom} vide zahtjev i odgovaraju ako mogu odmah.`,
    causes: [
      "pukla fleks ispod sudopere",
      "pukla magistrala ili ventil",
      "popustila spojnica na grejanju",
    ],
    faqs: [
      {
        q: "Ko plaća hitnu tarifu?",
        a: "Dogovor u ponudi — često viša cijena za izvan radnog vremena.",
      },
      {
        q: "Osiguranje?",
        a: "Čuvajte fotografije za prijavu osiguranju ako imate polisu.",
      },
    ],
  },
  {
    slug: "zidanje-pregrada",
    relatedServiceSlug: "grubi-gradjevinski-radovi",
    metaTitle: (c) => `Zidanje pregrade ${c} — blok, otvor | BrziMajstor.ME`,
    metaDescription: (loc, nom) =>
      `Nova pregrada, zatvaranje otvora ${loc}. Građevinski radovi ${nom}: statika i gradjevinski tim.`,
    intro: (loc, nom) =>
      `Zidanje pregrade traži provjeru da li je zid nosivi — bez statičara ne dirati noseće elemente. Za knauf ili blok pregradni zid treba tačna linija i veza za pod/plafon. Objavite dimenzije otvora i materijal koji želite. Timovi za grube radove ${nom} šalju ponude ili traže obilazak.`,
    causes: [],
    faqs: [
      {
        q: "Trebam li dozvolu?",
        a: "Zavisi od objekta i namjene — za sitne pregrade u stanu često ne, ali provjerite kućni red.",
      },
      {
        q: "Knauf ili blok?",
        a: "Knauf brže; blok bolje za nosivost kačenja teških elemenata.",
      },
    ],
  },
];

export const SEO_PROBLEM_BY_SLUG = Object.fromEntries(SEO_PROBLEMS.map((p) => [p.slug, p])) as Record<
  string,
  ProblemSeoDef
>;

export function getProblemCityStaticParams(): { slug: string }[] {
  const out: { slug: string }[] = [];
  for (const p of SEO_PROBLEMS) {
    for (const c of HOMEPAGE_CITIES) {
      out.push({ slug: `${p.slug}-${c.slug}` });
    }
  }
  return out;
}

export function parseProblemCitySlug(
  fullSlug: string
): { problem: ProblemSeoDef; citySlug: string; cityName: string } | null {
  const parts = fullSlug.split("-");
  if (parts.length < 2) return null;
  for (let cityParts = 1; cityParts <= 3; cityParts++) {
    const citySlug = parts.slice(-cityParts).join("-");
    const problemSlug = parts.slice(0, -cityParts).join("-");
    if (!problemSlug) continue;
    const cityName = CITY_SLUGS[citySlug];
    const problem = SEO_PROBLEM_BY_SLUG[problemSlug];
    if (cityName && problem) {
      return { problem, citySlug, cityName };
    }
  }
  return null;
}
