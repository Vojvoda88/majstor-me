/**
 * DEMO / STAGING BULK SEED — 50 majstora + 100 zahtjeva
 *
 * NE POKRETATI NA PRODUKCIJI bez eksplicitne namjere.
 *
 * Pokretanje:
 *   npm run seed:demo              — samo dodaje seed (kao prije)
 *   npm run seed:demo:reset        — briše demo podatke, pa ponovo seed
 *   npm run seed:demo:clean        — samo brisanje demo podataka (bez novog seeda)
 *
 * Sigurnost:
 *   - Odbija se ako je NODE_ENV=production i ALLOW_DEMO_SEED nije "true"
 *   - Za lokalni razvoj (development) dozvoljeno bez dodatnog flag-a
 *
 * Lozinka za sve demo naloge: Test123!
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { REQUEST_CATEGORIES, CITIES } from "../lib/constants";
import { DEMO_EMAIL_SUFFIX } from "../lib/demo-email";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Test123!";

function assertSafeToRun(): void {
  const allow =
    process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_SEED === "true";
  if (!allow) {
    console.error(
      "\n[seed-demo] ODBIJENO: NODE_ENV=production. Za staging postavi ALLOW_DEMO_SEED=true\n"
    );
    process.exit(1);
  }
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed * 7919 + 17) % arr.length]!;
}

const FIRST_NAMES = [
  "Marko", "Nikola", "Stefan", "Dušan", "Miloš", "Ivan", "Petar", "Aleksandar",
  "Jovan", "Luka", "Filip", "Andrija", "Vuk", "Nemanja", "Strahinja", "Ana",
  "Jelena", "Marija", "Tamara", "Milica", "Katarina", "Sara", "Ivana", "Danijela",
];

const LAST_NAMES = [
  "Marković", "Jovanović", "Petrović", "Nikolić", "Đurišić", "Vuković", "Radović",
  "Kovačević", "Popović", "Stanković", "Lukić", "Tomić", "Milić", "Đukanović",
  "Vujović", "Božović", "Šćepanović", "Lazović", "Mandić", "Perović",
];

const BIO_SNIPPETS = [
  "Radim brzo i čisto, dolazim na vreme.",
  "Iskustvo u stanovanju i poslovnim objektima.",
  "Besplatna procjena na licu mjesta.",
  "Koristim kvalitetan materijal, račun i garancija.",
  "Specijalizovan za stanove u starim zgradama.",
  "Radnim danima i subotom, hitne intervencije.",
  "Dogovor oko cijene bez skrivenih troškova.",
  "Preporuke od klijenata u gradu i okolini.",
  "Držim se rokova, komunikacija na viberu.",
  "Više od deset godina u zanatu.",
];

/** Kategorija mora tačno odgovarati REQUEST_CATEGORIES */
type Tpl = {
  category: string;
  title: string;
  shortDesc: string;
  longDesc: string;
};

const REQUEST_TEMPLATES: Tpl[] = [
  {
    category: "Vodoinstalater",
    title: "Curanje ispod sudopere u kuhinji",
    shortDesc:
      "Voda kaplje ispod sudopere, verovatno staro učvršćenje. Treba pregled i zaptivanje.",
    longDesc:
      "Curanje ispod sudopere u kuhinji primećeno prije par dana. Voda se skuplja u ormariću ispod, brisao sam ali se opet pojavi. Stan je u starijoj zgradi, cijevi su verovatno stare. Treba detaljan pregled, eventualno zamjena creva ili zaptivanje spojeva. Molim termin što pre jer koristim kuhinju svakodnevno. Lokacija centar grada, parking u blizini.",
  },
  {
    category: "Električar",
    title: "Zamena utičnica u dnevnoj sobi",
    shortDesc: "Tri utičnice labave, jedna ponekad iskreće pri uključivanju.",
    longDesc:
      "U dnevnoj sobi imam tri utičnice koje su labave; kad uključim produžni kabl lampa povremeno treperi. Jedna je i blago zagrejana na dodir. Bojim se požara pa želim provjeru instalacije i zamjenu ako treba. Stan iz sedamdesetih, nije mijenjana elektrika. Može termin poslije podne.",
  },
  {
    category: "Klima servis",
    title: "Klima ne hladi kao prije",
    shortDesc: "Split u spavaćoj sobi slabije hladi, možda treba servis ili plin.",
    longDesc:
      "Klima je stara oko osam godina, prošle godine je radila dobro. Sada hladi slabije, vanjska jedinica radi ali osjećaj u sobi nije kao ranije. Filter sam čistio. Treba stručnjak da procijeni da li treba punjenje plina, servis ili nešto treće. Sprat, pristup vanjskoj jedinici preko terase.",
  },
  {
    category: "Sitni kućni poslovi",
    title: "Krečenje stana pre useljenja",
    shortDesc: "Dvosoban stan, oko pedeset pet kvadrata, neutralna boja.",
    longDesc:
      "Kupili smo stan, treba krečenje pre nameštaja. Zidovi su uglavnom u redu, par manjih pukotina u hodniku. Želimo neutralnu belu ili svetlo sivu boju, kvalitetnu boju koja traje. Plafoni isto. Može ponuda po kvadratu sa materijalom ili bez, dogovorljivo oko termina.",
  },
  {
    category: "Keramičar",
    title: "Postavljanje pločica u kupatilu",
    shortDesc: "Mala kupatila, pod i dio zida do visine tuša.",
    longDesc:
      "Renoviramo kupatilo, imamo pločice kupljene, treba majstor za postavljanje. Pod je pripremljen, hidroizolacija urađena od prethodne faze. Treba nivelacija, lepak i fugovanje. Roštilj za tuš već postoji. Rok nam je za tri sedmice ako je moguće.",
  },
  {
    category: "Selidbe",
    title: "Selidba iz stana u stan, isti grad",
    shortDesc: "Namještaj i kutije, bez klavira, dva sprata lift postoji.",
    longDesc:
      "Selidba unutar istog grada, iz jednog stana u drugi, udaljenost oko pet kilometara. Ima kauč, orman, frižider, kreveti, kutije. Lift radi u oba objekta. Treba dvojica ljudi i kombi ili manji kamion, procjena trajanja i cijene. Datum fleksibilan ali preferiram vikend.",
  },
  {
    category: "Dubinsko čišćenje",
    title: "Dubinsko čišćenje stana nakon radova",
    shortDesc: "Prašina i tragovi ljepila od renoviranja, podovi i prozori.",
    longDesc:
      "Završili smo manju adaptaciju, cijeli stan je u prašini. Treba dubinsko čišćenje podova laminat i pločice, prozora, kuhinjskih elemenata. Otprilike sedamdeset kvadrata. Može u toku sedmice ujutro.",
  },
  {
    category: "Bravar",
    title: "Popravka brave na ulaznim vratima",
    shortDesc: "Ključ teško ulazi, brava škripi, moždazamena cilindra.",
    longDesc:
      "Na ulaznim vratima stana brava postaje sve tvrđa. Ponekad moram dva puta okrenuti ključ. Želim da neko pogleda da li se može popraviti ili treba novi cilindar. Hitno nije, ali u narednih deset dana.",
  },
  {
    category: "Servis veš mašina",
    title: "Veš mašina ne ispire kako treba",
    shortDesc: "Program završi ali deterdžent ostane u ladici.",
    longDesc:
      "Veš mašina je starija pet godina. Zadnja dva pranja deterdžent ostane u ladici, kao da ne vuče vodu kroz njega. Ostalo radi, centrifuga ok. Treba dijagnostika i popravka ako je moguće.",
  },
  {
    category: "PVC stolarija",
    title: "Zamjena dijela PVC stolarije",
    shortDesc: "Jedan prozor ne zatvara kako treba, dihtung oštećen.",
    longDesc:
      "U dnevnoj sobi PVC prozor donji dio ne zatvara hermetički, puše na vjetru. Dihtung je očigledno star. Treba pregled izamena dihtunga ili cijelog krila ako je potrebno. Sprat četvrti, lift postoji.",
  },
  {
    category: "Stolar",
    title: "Prilagođavanje unutrašnjih vrata",
    shortDesc: "Vrata od stana u stubište ne prianjaju, treba struganje i šarke.",
    longDesc:
      "Drvena vrata u hodniku nakon postavljanja novog poda više ne prianjaju kako treba. Treba majstor stolar da skinu, prilagodi visinu i vrati. Rok fleksibilan.",
  },
  {
    category: "Montaža nameštaja",
    title: "Montaža kuhinjskih elemenata",
    shortDesc: "Elementi kupljeni, treba sklapanje i kačenje na zid.",
    longDesc:
      "Imam kuhinju iz jednog poznatog lanca, kutije su u stanu. Treba profesionalna montaža, nivelacija, bušenje za šine i vodu za sudoperu. Procena jednog ili dva dana rada. Molim iskustvo sa sličnim montažama.",
  },
  {
    category: "Čišćenje",
    title: "Generalno čišćenje stana pre praznika",
    shortDesc: "Trosoban stan, fokus kupatilo i kuhinja.",
    longDesc:
      "Trebamo generalno čišćenje pre dolaska gostiju. Trosoban stan, oko osamdeset kvadrata. Posebno kupatilo i kuhinja, podovi parket i pločice. Može subotom.",
  },
  {
    category: "Građevinski radovi",
    title: "Mali zid u dnevnoj sobi — probijanje niše",
    shortDesc: "Treba probiti otvor za police, nosivi zid nije.",
    longDesc:
      "Želimo da se u dnevnoj sobi napravi niša za TV, zid je prethodno provjeren kao nenosivi. Treba precizno rezanje i obrada ivica. Prašina treba što manje, zaštita poda obavezna.",
  },
  {
    category: "Alarm / video nadzor",
    title: "Ugradnja jedne kamere na ulazu",
    shortDesc: "Kuća, želimo jednu kameru i snimanje na memoriju.",
    longDesc:
      "Porodična kuća, treba jedna vanjska kamera iznad ulaznih vrata sa noćnim vidom i snimanjem. Mreža postoji u kući. Molim ponudu opreme i ugradnje.",
  },
  {
    category: "Grubi građevinski radovi",
    title: "Zidanje nosećeg zida proširenje terase",
    shortDesc: "Blokovi, armatura, betoniranje — treba ekipa za grub rad.",
    longDesc:
      "Proširujemo terasu prema dvorištu, noseći zid već dogovoren sa statičarom. Treba zidar za blokove, vezivanje armature i betoniranje ploče. Oko trideset kvadrata radišta, pristup dvorištu s ulice. Ponuda sa rokovima i materijalom ili samo rad.",
  },
  {
    category: "Krovopokrivač",
    title: "Curenje krova poslije jakih padavina",
    shortDesc: "Kapljice u potkrovlju, treba inspekcija i krpljenje.",
    longDesc:
      "Posle prošlog pljuska primetili smo mokre mrlje na plafonu potkrovlja. Treba neko da izađe na krov, pronađe pukotinu i zalije. Krov je crijep, kuća u starijem naselju.",
  },
  {
    category: "Fasade / izolacija",
    title: "Mrlje od vlage na spoljašnjem zidu",
    shortDesc: "Spoljni zid spavaće sobe, treba procjena i sanacija.",
    longDesc:
      "Na spoljašnjem zidu spavaće sobe pojavile su se mrlje od vlage unutra. Treba stručnjak za fasade da procijeni da li je kapilarna vlaga ili prodor s kišom. Ponuda za sanaciju.",
  },
  {
    category: "Parketar",
    title: "Škripanje parketa u hodniku",
    shortDesc: "Laminat ili parket stariji, škripi na jednom delu.",
    longDesc:
      "U hodniku pod škripi kad se pređe preko jedne trake. Nije bilo pre renoviranja zida. Treba majstor parketar da procijeni da li treba ponovno pričvršćivanje ili delimična zamena.",
  },
  {
    category: "TV / antene / internet instalacije",
    title: "Premeštanje TV tačke i interneta u sobu",
    shortDesc: "Nova soba za rad, treba produžiti kablove i utičnicu.",
    longDesc:
      "Radim od kuće, treba da premjestim glavnu internet tačku i TV priključak u drugu sobu. Zidovi su gips, oko pet metara kabla. Molim stručnu ugradnju utičnica.",
  },
  {
    category: "Sitne kućne popravke",
    title: "Više sitnih poslova u stanu",
    shortDesc: "Viseća polica, ručka na ormanu, jedna lampa.",
    longDesc:
      "Treba majstor za sitne popravke: montaža viseće police u kuhinji,zamena ručke na ormanu, kačenje lustera u hodniku. Procena pola dana rada, materijal već kupljen gde treba.",
  },
  {
    category: "Gipsani radovi",
    title: "Prepravka spuštenog plafona u hodniku",
    shortDesc: "Stari gips pukao, treba demontaža i novi sloj.",
    longDesc:
      "Spušteni plafon u hodniku pukao nakon curenja iznad koje je sanirano. Treba skinuti oštećeni dio i napraviti novi gips kartonski plafon sa LED trakom. Dimenzije hodnika oko osam kvadrata.",
  },
  {
    category: "Sanacija vlage",
    title: "Mikroorganizmi u uglu spavaće sobe",
    shortDesc: "Osjećaj vlage, treba inspekcija i tretman.",
    longDesc:
      "U uglu spavaće sobe zida blizu kupatila pojavila se tamna mrlja. Treba stručnjak za vlagu da uradi merenje i predloži sanaciju pre krečenja.",
  },
  {
    category: "Odvoz šuta / otpada",
    title: "Odvoz građevinskog šuta nakon adaptacije",
    shortDesc: "Oko dva kubika šuta u dvorištu, treba kontejner ili pick up.",
    longDesc:
      "Završena manja adaptacija, ostalo je šuta i starih pločica u dvorištu. Treba odvoz na deponiju sa eko računom. Lokacija prilaz širok.",
  },
  {
    category: "Solarni sistemi / paneli",
    title: "Konsultacija za solarne panele na krovu",
    shortDesc: "Želimo procjenu isplativosti prije kupovine.",
    longDesc:
      "Kuća sa ravnim krovom, oko sto pedeset kvadrata. Zanimaju nas solarni paneli za vlastitu potrošnju. Treba stručnjak za procjenu orijentacije krova i grubu ponudu.",
  },
  {
    category: "Roletne / tende",
    title: "Zamena roletni na jednom prozoru",
    shortDesc: "Roletna ne ide do kraja, mehanizam oštećen.",
    longDesc:
      "Spoljna roletna na spavaćoj sobi zaglavila se na pola. Treba servis ilizamena mehanizma. Dimenzije standardne za dvokrilni prozor.",
  },
  {
    category: "Servis bojlera",
    title: "Bojler dugo greje vodu",
    shortDesc: "Električni bojter u kupatilu, voda topla tek nakon pola sata.",
    longDesc:
      "Bojler je star oko deset godina, kapacitet osamdeset litara. Prije je grejao brže. Treba servis ilizamena grijača ako je potrebno. Stan na drugom spratu.",
  },
  {
    category: "Ugradnja kuhinja",
    title: "Dogradnja ostrva u kuhinji",
    shortDesc: "Već postoji kuhinja, treba dodatak ostrva od ploča.",
    longDesc:
      "Želimo mali pult ostrvo u sredini kuhinje. Materijal sličan postojećim frontama. Treba majstor za rezanje ploča i montažu. Električna tačka već u blizini.",
  },
  {
    category: "Moler",
    title: "Špaktovanje i krečenje nakon pukotine",
    shortDesc: "Pukotina iznad vrata, treba gips i kreč.",
    longDesc:
      "Nakon malog potresa ili sleganja zgrade pojavila se pukotina iznad ulaza u sobu. Treba otvoriti, ugraditi traku, špakovati i krečiti u boji kao ostatak zida.",
  },
  {
    category: "Dvorište / bašta",
    title: "Kosenje velike travnjake i orezivanje živice",
    shortDesc: "Porodična kuća, oko pet ara, živa ograda.",
    longDesc:
      "Treba redovno kosenje travnjaka i jednom godišnje orezivanje žive ograde. Površina oko pet stotina kvadrata. Može dogovor na sezonu.",
  },
];

function fullName(i: number): string {
  return `${pick(FIRST_NAMES, i)} ${pick(LAST_NAMES, i + 3)}`;
}

function handymanEmail(i: number): string {
  return `demo.majstor.${i}@local.majstor.demo`;
}

function userEmail(i: number): string {
  return `demo.korisnik.${i}@local.majstor.demo`;
}

async function ensureCategoriesExist(): Promise<void> {
  for (const name of REQUEST_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
}

/**
 * Briše isključivo demo podatke (identitet po email domenu i gost zahtjevima).
 * Ne dira korisnike čiji email NE završava na DEMO_EMAIL_SUFFIX.
 * Gost demo zahtjevi: requesterEmail počinje sa "gost." i završava na "@local.invalid"
 * (isti format kao u ovom seedu).
 */
export async function deleteDemoData(): Promise<void> {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    select: { id: true, email: true, role: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);

  const guestDemoWhere = {
    userId: null,
    requesterEmail: { startsWith: "gost.", endsWith: "@local.invalid" },
  };

  const demoRequests = await prisma.request.findMany({
    where: {
      OR: [
        ...(demoUserIds.length > 0 ? [{ userId: { in: demoUserIds } }] : []),
        guestDemoWhere,
      ],
    },
    select: { id: true },
  });
  const demoRequestIds = demoRequests.map((r) => r.id);

  if (demoRequestIds.length > 0) {
    await prisma.distributionJob.deleteMany({
      where: { requestId: { in: demoRequestIds } },
    });
  }

  if (demoUserIds.length > 0) {
    await prisma.funnelEvent.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
  }

  const deletedReq = await prisma.request.deleteMany({
    where: {
      OR: [
        ...(demoUserIds.length > 0 ? [{ userId: { in: demoUserIds } }] : []),
        guestDemoWhere,
      ],
    },
  });
  console.log(`[seed-demo] Obrisano zahtjeva (demo): ${deletedReq.count}`);

  if (demoUserIds.length > 0) {
    const deletedUsers = await prisma.user.deleteMany({
      where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    });
    console.log(`[seed-demo] Obrisano korisnika (demo): ${deletedUsers.count}`);
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const resetThenSeed = argv.includes("--reset");
  const resetOnly = argv.includes("--reset-only");

  assertSafeToRun();

  if (resetThenSeed || resetOnly) {
    console.log("[seed-demo] Reset mod — brisanje demo podataka…");
    await deleteDemoData();
    if (resetOnly) {
      console.log("[seed-demo] Clean završen (bez novog seeda).");
      return;
    }
    console.log("[seed-demo] Nastavljam sa seedom…");
  }

  console.log("[seed-demo] Start (50 majstora, 100 zahtjeva)…");

  await ensureCategoriesExist();
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const categoryNames = [...REQUEST_CATEGORIES];
  const cities = [...CITIES];

  const handymanUserIds: string[] = [];

  for (let i = 0; i < 50; i++) {
    const email = handymanEmail(i);
    const name = fullName(i + 100);
    const city = pick(cities, i * 7);
    const phone = `+382 69 ${String(200000 + i).slice(-6)}`;

    const emailVerified =
      i % 10 !== 7 && i % 10 !== 8 ? new Date("2024-06-01") : null;
    const phoneVerified =
      i % 13 === 0 || i % 17 === 3 ? new Date("2024-08-15") : null;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        city,
        phone,
        emailVerified,
        phoneVerified,
      },
      create: {
        email,
        name,
        passwordHash,
        role: "HANDYMAN",
        city,
        phone,
        emailVerified,
        phoneVerified,
      },
    });
    handymanUserIds.push(user.id);

    let creditsBalance = 0;
    if (i < 8) creditsBalance = 0;
    else if (i < 25) creditsBalance = 8 + (i % 18);
    else if (i < 40) creditsBalance = 40 + (i % 80);
    else creditsBalance = 200 + (i % 400);

    const catCount = 1 + (i % 3);
    const cats: string[] = [];
    for (let c = 0; c < catCount; c++) {
      cats.push(pick(categoryNames, i * 11 + c * 3));
    }
    const uniqueCats = Array.from(new Set(cats));

    const bio =
      `${pick(BIO_SNIPPETS, i)} ${pick(BIO_SNIPPETS, i + 5)}`.slice(0, 480);
    const years = 3 + (i % 22);
    const rating = Math.round((3.2 + (i % 17) * 0.12) * 10) / 10;
    const reviews = i % 9 === 0 ? 0 : 1 + (i % 34);

    const prof = await prisma.handymanProfile.upsert({
      where: { userId: user.id },
      update: {
        bio,
        cities: [city, pick(cities, i + 1)].filter((x, j, a) => a.indexOf(x) === j),
        yearsOfExperience: years,
        creditsBalance,
        workerStatus: "ACTIVE",
        verifiedStatus: i % 4 === 0 ? "PENDING" : "VERIFIED",
        ratingAvg: Math.min(5, rating),
        reviewCount: reviews,
      },
      create: {
        userId: user.id,
        bio,
        cities: [city, pick(cities, i + 2)].filter((x, j, a) => a.indexOf(x) === j),
        yearsOfExperience: years,
        creditsBalance,
        workerStatus: "ACTIVE",
        verifiedStatus: i % 4 === 0 ? "PENDING" : "VERIFIED",
        ratingAvg: Math.min(5, rating),
        reviewCount: reviews,
      },
    });

    const categoryRecs = await prisma.category.findMany({
      where: { name: { in: uniqueCats } },
      select: { id: true },
    });
    await prisma.workerCategory.deleteMany({ where: { workerId: prof.id } });
    for (const c of categoryRecs) {
      await prisma.workerCategory.create({
        data: { workerId: prof.id, categoryId: c.id },
      });
    }
  }
  console.log("[seed-demo] Majstori: 50");

  const clientUserIds: string[] = [];
  for (let i = 0; i < 40; i++) {
    const emailVerified =
      i % 5 === 0 ? null : i % 7 === 0 ? new Date("2024-02-01") : new Date("2024-01-10");
    const phoneVerified = i % 11 === 0 ? new Date("2024-04-01") : null;

    const u = await prisma.user.upsert({
      where: { email: userEmail(i) },
      update: {
        emailVerified,
        phoneVerified,
      },
      create: {
        email: userEmail(i),
        name: pick(FIRST_NAMES, i + 50),
        passwordHash,
        role: "USER",
        city: pick(cities, i * 5),
        phone: `+382 67 ${String(300000 + i).slice(-6)}`,
        emailVerified,
        phoneVerified,
      },
    });
    clientUserIds.push(u.id);
  }
  console.log("[seed-demo] Demo korisnici (USER): 40");

  const urgencyCycle: Array<"HITNO_DANAS" | "U_NAREDNA_2_DANA" | "NIJE_HITNO"> = [
    "HITNO_DANAS",
    "U_NAREDNA_2_DANA",
    "NIJE_HITNO",
  ];
  const statusWeights: Array<"OPEN" | "IN_PROGRESS" | "COMPLETED"> = [
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "OPEN",
    "IN_PROGRESS",
    "COMPLETED",
  ];

  const tplCount = REQUEST_TEMPLATES.length;

  for (let i = 0; i < 100; i++) {
    const tpl = REQUEST_TEMPLATES[i % tplCount]!;
    const useLong = i % 3 !== 1;
    const description = useLong ? tpl.longDesc : tpl.shortDesc;

    const category = tpl.category;
    const city = pick(cities, i * 17 + 5);
    const urgency = urgencyCycle[i % 3]!;
    const status = pick(statusWeights, i * 19);

    const withPhotos = i % 4 === 0 || i % 7 === 2;
    const photos = withPhotos
      ? [`https://picsum.photos/seed/majstordemo${i}/800/600`]
      : [];

    const guest = i % 5 === 0;
    const uid = guest ? null : pick(clientUserIds, i);

    const daysAgo = (i * 7) % 45;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(10 + (i % 8), (i * 13) % 60, 0, 0);

    let adminStatus: "DISTRIBUTED" | "CONTACT_UNLOCKED" | "CLOSED" = "DISTRIBUTED";
    if (status === "OPEN") adminStatus = "DISTRIBUTED";
    else if (status === "IN_PROGRESS") adminStatus = "CONTACT_UNLOCKED";
    else adminStatus = "CLOSED";

    const titleVariant =
      i >= tplCount ? `${tpl.title} (${city})` : tpl.title;

    if (guest) {
      await prisma.request.create({
        data: {
          category,
          title: titleVariant,
          description,
          city,
          address: `Ulica ${100 + i}, ${city}`,
          urgency,
          status,
          photos,
          adminStatus,
          requesterName: pick(FIRST_NAMES, i + 20),
          requesterPhone: `+382 68 ${String(400000 + i).slice(-6)}`,
          requesterEmail: `gost.${i}.demo@local.invalid`,
          createdAt,
        },
      });
    } else {
      await prisma.request.create({
        data: {
          userId: uid!,
          category,
          title: titleVariant,
          description,
          city,
          address: `${pick(["Njegoševa", "Slobode", "Vučedolska", "Bulevar"], i)} ${10 + (i % 90)}, ${city}`,
          urgency,
          status,
          photos,
          adminStatus,
          createdAt,
        },
      });
    }
  }
  console.log("[seed-demo] Zahtjevi: 100");
  console.log("[seed-demo] Gotovo. Lozinka za demo naloge:", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error("[seed-demo] Greška:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
