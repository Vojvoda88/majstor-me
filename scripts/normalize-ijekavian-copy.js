/**
 * Ijekavski pravopis u stringovima/komentarima (.ts/.tsx): ekavizmi → ijekavica.
 * Pokretanje: node scripts/normalize-ijekavian-copy.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", "dist", "build", ".git", "playwright-report", "test-results"]);

/** Duži stringovi prvi. */
const PAIRS = [
  ["obaveštavamo majstore", "obavještavamo majstore"],
  ["Greška pri uključivanju obaveštenja", "Greška pri uključivanju obavještenja"],
  ["Nije moguće uključiti obaveštenja", "Nije moguće uključiti obavještenja"],
  ["Push obaveštenja trenutno nisu", "Push obavještenja trenutno nisu"],
  ["Preglednik ne podržava obaveštenja", "Preglednik ne podržava obavještenja"],
  ["Primaj push obaveštenja (admin)", "Primaj push obavještenja (admin)"],
  ["Primaj obaveštenja za nove poslove", "Primaj obavještenja za nove poslove"],
  ["Prijavi se za obaveštenja", "Prijavi se za obavještenja"],
  ["Dozvola za obaveštenja je odbijena", "Dozvola za obavještenja je odbijena"],
  ["dozvoli obaveštenja", "dozvoli obavještenja"],
  ["Provera obaveštenja", "Provjera obavještenja"],
  ["Provera obavještenja…", "Provjera obavještenja…"],
  ["obaveštenjima", "obavještenjima"],
  ["obaveštenja", "obavještenja"],
  ["Obaveštenja", "Obavještenja"],
  ["obaveštenje", "obavještenje"],
  ["obaveštenju", "obavještenju"],
  ["obavešt", "obavješt"],

  ["kako biste nastavili korišćenje naloga", "kako biste nastavili korištenje naloga"],
  ["možemo ga obavestiti", "možemo ga obavijestiti"],

  ["Jednokratni token (hash u bazi). Nakon uspeha briše", "Jednokratni token (hash u bazi). Nakon uspjeha briše"],
  ["Lead view → unlock (uspeh)", "Lead view → unlock (uspjeh)"],
  ["Start kupovine → uspeh", "Start kupovine → uspjeh"],

  ["Osvežite stranicu; na HTTPS proverite", "Osvježite stranicu; na HTTPS provjerite"],
  ["Osvežite stranicu i pokušajte ponovo.", "Osvježite stranicu i pokušajte ponovo."],
  ["Osvežite stranicu i pokušajte ponovo", "Osvježite stranicu i pokušajte ponovo"],
  ["Service worker nije spreman. Osvežite", "Service worker nije spreman. Osvježite"],
  ["Osveži bez filtera", "Osvježi bez filtera"],

  ["Podeli zahtjev (kopiraj link)", "Podijeli zahtjev (kopiraj link)"],
  ["Podeli → Dodaj na početni ekran", "Podijeli → Dodaj na početni ekran"],
  ["preko Podeli → Početni", "preko Podijeli → Početni"],

  ["ne delite ga javno", "ne dijelite ga javno"],
  ["svi dele jedan globalni", "svi dijele jedan globalni"],
  ["Grad može biti 1-3 dela (niksic", "Grad može biti 1-3 dijela (niksic"],
  ["(dele ga svi bez IP-a)", "(dijele ga svi bez IP-a)"],
  ["delu za majstore", "dijelu za majstore"],

  ["Zamena dela PVC", "Zamjena dijela PVC"],
  ["do zamene sanitarija", "do zamjene sanitarija"], // already ijekavski "zamjene" - wait, current is "zamene" ekavian
  ["do zamene sanitarija", "do zamjene sanitarija"],
  ["radova na cevovodu", "radova na cijevovodu"],
  ["curenje,zamena,", "curenje, zamjena,"],
  ["curenje,zamena ", "curenje, zamjena "],
  ["Jedan besplatan zahtjev zamenjuje", "Jedan besplatan zahtjev zamjenjuje"],
  ["želim proveru instalacije izamenu", "želim provjeru instalacije i zamjenu"],
  ["nije menjana elektrika", "nije mijenjana elektrika"],
  ["cevi su verovatno stare", "cijevi su verovatno stare"],
  ["eventualno zamena creva", "eventualno zamjena creva"],
  ["Pukla cev u kupatilu", "Pukla cijev u kupatilu"],

  ["Najbolje ocenjeni", "Najbolje ocijenjeni"],
  ["Ocenite majstora", "Ocijenite majstora"],
  ["Procenjeni dolazak", "Procijenjeni dolazak"],
  ["profili sa ocenama", "profili sa ocjenama"],
  ["Pomažu majstorima da bolje procene.", "Pomažu majstorima da bolje procijene."],
  ["šta je uključeno u procenu", "šta je uključeno u procjenu"],
  ["to pomaže proceni da li", "to pomaže procjeni da li"],
  ["Majstor može dodatno proceniti na licu mesta.", "Majstor može dodatno procijeniti na licu mjesta."],
  ["majstor procenjuje na licu mesta.", "majstor procjenjuje na licu mjesta."],
  ["da proceni pristup", "da procijeni pristup"],
  ["majstora proceni isti", "majstora procijeni isti"],
  ["Treba majstor parketar da proceni", "Treba majstor parketar da procijeni"],
  ["Treba stručnjak da proceni", "Treba stručnjak da procijeni"],
  ["Treba stručnjak za fasade da proceni", "Treba stručnjak za fasade da procijeni"],
  ["Bolje procene.", "Bolje procijene."],

  ["Besplatna procena na licu mesta.", "Besplatna procjena na licu mjesta."],
  ["procena trajanja i cene.", "procjena trajanja i cijene."],
  ["Dogovor oko cene bez", "Dogovor oko cijene bez"],
  ["Kako uporediti cene?", "Kako uporediti cijene?"],
  ["jasna cena pre početka.", "jasna cijena prije početka."],
  ["uz uvid u ocene i cenu u ponudi.", "uz uvid u ocjene i cijenu u ponudi."],
  ["Detalji paketa i cena su", "Detalji paketa i cijena su"],
  ["Najbolja vrednost", "Najbolja vrijednost"],
  ["Tip cene / način naplate", "Tip cijene / način naplate"],
  ["Šta je uključeno u cenu (opciono)", "Šta je uključeno u cijenu (opciono)"],
  ["uobičajenoj ceni", "uobičajenoj cijeni"],
  ["Od čega zavisi cena kontakta", "Od čega zavisi cijena kontakta"],
  ["Fiksna cena zahteva iznos", "Fiksna cijena zahtijeva iznos"],
  ["Tipovi cene u ponudi", "Tipovi cijene u ponudi"],
  ["{ value: \"FIKSNA\", label: \"Fiksna cena\" }", '{ value: "FIKSNA", label: "Fiksna cijena" }'],
  [
    '{ value: "PREGLED_PA_KONACNA", label: "Pregled pa konačna cena" }',
    '{ value: "PREGLED_PA_KONACNA", label: "Pregled pa konačna cijena" }',
  ],
  ["Okvirna cena", "Okvirna cijena"],
  ["Fiksna cena", "Fiksna cijena"],
  ["Pregled pa konačna cena", "Pregled pa konačna cijena"],

  ["enum vrednosti ne menjamo", "enum vrijednosti ne mijenjamo"],
  ["oglasa se vidi pre.", "oglasa se vidi prije."],
  ["Svi Category.name vrednosti", "Svi Category.name vrijednosti"],
  ["internalCategory = vrednost", "internalCategory = vrijednost"],
  ["Vraća null za vrednosti ako", "Vraća null za vrijednosti ako"],
  ["Fallback (DB string — ne menjati)", "Fallback (DB string — ne mijenjati)"],

  ["izbegava mrtve", "izbjegava mrtve"],
  ["izbegava P2022", "izbjegava P2022"],
  ["izbegava useSearchParams", "izbjegava useSearchParams"],
  ["da izbegnemo \"rad", "da izbjegnemo \"rad"],
  ["izbegava MAX_REQUESTS_PER_DAY", "izbjegava MAX_REQUESTS_PER_DAY"],
  ["pre sanitizacije (izbegava", "prije sanitizacije (izbjegava"],

  ["Webhook zahteva poseban", "Webhook zahtijeva poseban"],
  ["obrada uplate zahteva webhook", "obrada uplate zahtijeva webhook"],
  ["Chrome zahteva registriran", "Chrome zahtijeva registriran"],
  ["dozvola zahteva korisnički", "dozvola zahtijeva korisnički"],
  ["useSearchParams u RequestFilters zahteva Suspense", "useSearchParams u RequestFilters zahtijeva Suspense"],
  ["jednom mestu", "jednom mjestu"],
  ["na licu mesta", "na licu mjesta"],
  ["na jednom mestu", "na jednom mjestu"],

  ["umesto client fetcha", "umjesto client fetcha"],
  ["umesto N.", "umjesto N."],
  ["umesto starog keša", "umjesto starog keša"],
  ["umesto toga", "umjesto toga"],
  ["umesto više poziva", "umjesto više poziva"],
  ["jedan zahtjev umesto", "jedan zahtjev umjesto"],
  ["Zašto jedan zahtjev umesto", "Zašto jedan zahtjev umjesto"],
  [" i umesto da zovete", " i umjesto da zovete"],
  [" — umesto da zovete", " — umjesto da zovete"],
  ["majstora umesto da ih", "majstora umjesto da ih"],

  ["uporedite pre odluke", "uporedite prije odluke"],
  ["uporediti pre angažmana", "uporediti prije angažmana"],
  ["uporedite ponude pre angažmana", "uporedite ponude prije angažmana"],
  ["uporedite pre angažmana", "uporedite prije angažmana"],
  ["uporedite pre nego što odlučite", "uporedite prije nego što odlučite"],
  ["lakše uporedite pre nego što odlučite", "lakše uporedite prije nego što odlučite"],
  ["više ponuda pre odluke", "više ponuda prije odluke"],
  ["uporedite ponude pre odluke", "uporedite ponude prije odluke"],
  ["uporedite pre odluke.", "uporedite prije odluke."],
  ["lakše uporedite ponude pre odluke", "lakše uporedite ponude prije odluke"],
  ["štedite vreme i lakše uporedite ponude pre odluke", "štedite vrijeme i lakše uporedite ponude prije odluke"],
  ["uporedite pre angažmana.", "uporedite prije angažmana."],
  ["vi uporedite pre angažmana", "vi uporedite prije angažmana"],
  ["pre ili posle sezone", "prije ili poslije sezone"],
  ["Mogu li videti iskustvo majstora pre kontakta?", "Mogu li videti iskustvo majstora prije kontakta?"],
  ["admin pregleda pre nego što profil", "admin pregleda prije nego što profil"],
  ["Kratki odgovori pre nego što objavite", "Kratki odgovori prije nego što objavite"],
  ["majstora pre nego što počnu", "majstora prije nego što počnu"],
  ["korisnika pre nego što pozovete", "korisnika prije nego što pozovete"],
  ["na pregled pre nego što bude", "na pregled prije nego što bude"],
  ["da zahtjev što pre ide", "da zahtjev što prije ide"],
  ["primećeno pre par dana", "primećeno prije par dana"],
  ["Greška pri prijavi (klijent). Osvežite", "Greška pri prijavi (klijent). Osvježite"],

  ["Ne plaćate “na slepo”", "Ne plaćate “na slijepo”"],

  ["nameštaj, vrata", "namještaj, vrata"],
  ["za nameštaj, vrata", "za namještaj, vrata"],
  ["zameni utičnica, rasveti", "zamijeni utičnica, rasvjeti"],
  ["varira svetlo, miris", "varira svjetlo, miris"],
  ["samo zamenu utičnica ili rasvetu?", "samo zamjenu utičnica ili rasvjetu?"],
  ["nove tačke, rasvetu ili", "nove tačke, rasvjetu ili"],
  ["kvar, rasveta) i termin", "kvar, rasvjeta) i termin"],
  ["tabla osigurača, rasveta,", "tabla osigurača, rasvjeta,"],
  ["rasveta, priključenja", "rasvjeta, priključenja"],

  ["Električar u ${loc}: nameštaj", "Električar u ${loc}: namještaj"],
  ["ponude uporedive po ceni.", "ponude usporedive po cijeni."],
  ["u zahtjev unesite mere i rok", "u zahtjev unesite mjere i rok"],

  ["Aktivni majstor je izmenio javni", "Aktivni majstor je izmijenio javni"],
  ["Ako kasnije izmenite opis", "Ako kasnije izmijenite opis"],

  ["treba da premestim glavnu", "treba da premjestim glavnu"],
  ["vanjska jedinica radi ali osećaj", "vanjska jedinica radi ali osjećaj"],

  ["prosjecno", "prosječno"],
  ["Prosječno vreme", "Prosječno vrijeme"],

  ["Šta se dešava posle objave?", "Šta se dešava poslije objave?"],
  ["Šta se dešava posle", "Šta se dešava poslije"],
  ["posle podne.", "poslije podne."],
  ["posle jakih padavina", "poslije jakih padavina"],
  ["posle deploy-a", "poslije deploy-a"],

  ["nije primenila migracije", "nije primijenila migracije"],
  ["Kolona/tabela ne postoji u bazi — migracije nisu primenjene", "Kolona/tabela ne postoji u bazi — migracije nisu primijenjene"],

  ["/** jači savet da", "/** jači savjet da"],

  ["proveri logove", "provjeri logove"],
  ["proverite migracije", "provjerite migracije"],
  ["proverite NEXTAUTH_URL", "provjerite NEXTAUTH_URL"],
  ["proveru instalacije", "provjeru instalacije"],
  ["proveru pritiska", "provjeru pritiska"],
  ["proveru klime", "provjeru klime"],
  ["sigurnosnu proveru instalacije", "sigurnosnu provjeru instalacije"],
  ["sigurnosnu proveru", "sigurnosnu provjeru"],
  ["detaljnija provera instalacije", "detaljnija provjera instalacije"],
  ["tražiti proveru cijele", "tražiti provjeru cijele"],
  ["želite pregled stanja instalacije ili sigurnosnu proveru", "želite pregled stanja instalacije ili sigurnosnu provjeru"],
  ["za servis ili proveru klime", "za servis ili provjeru klime"],
  ["Nije moguće proveriti pretplatu", "Nije moguće provjeriti pretplatu"],
  ["izaberete ni jedan", "odaberete ni jedan"],
  ["ne izabere gradove", "ne odabere gradove"],
  ["klijent izabere.", "klijent odabere."],
  ["Slikaj / izaberi sliku", "Slikaj / odaberi sliku"],
  ["minimalno|izaberite", "minimalno|odaberite"],

  ["Admin nalog se ne može obrisati ovde.", "Admin nalog se ne može obrisati ovdje."],
  ["SessionProvider je već u root layoutu (app/layout.tsx). Dupli <Providers> ovde", "SessionProvider je već u root layoutu (app/layout.tsx). Dupli <Providers> ovdje"],
  ["uvek vidljivo", "uvijek vidljivo"],
  ["forgot-password uvek vraća", "forgot-password uvijek vraća"],
  ["PWA uvek otvara www", "PWA uvijek otvara www"],

  ["Ovde ste ako vam treba", "Ovdje ste ako vam treba"],

  [
    "Kada se promene URL parametri ili inicijalne vrednosti, sinhronizuj formu",
    "Kada se promijene URL parametri ili inicijalne vrijednosti, sinhronizuj formu",
  ],
  ["Potrebna provera instalacija", "Potrebna provjera instalacija"],
  ["i dobijete uporedive ponude", "i dobijete usporedive ponude"],
  ["uporedive ponude", "usporedive ponude"],
];

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(full, acc);
    } else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".d.ts")) {
      acc.push(full);
    }
  }
}

PAIRS.sort((a, b) => b[0].length - a[0].length);

const files = [];
walk(ROOT, files);

let changed = 0;
for (const file of files) {
  const rel = file.replace(/\\/g, "/");
  if (rel.includes("scripts/normalize-")) continue;

  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [from, to] of PAIRS) {
    if (!from || from === to) continue;
    text = text.split(from).join(to);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`\nFajlova: ${changed}`);
