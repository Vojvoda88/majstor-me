/**
 * Drugi prolaz: tipični hrvatski oblici (bez kratkih podstringova koji kvare kod).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", "dist", "build", ".git", "playwright-report", "test-results"]);

const PAIRS = [
  ["Umjesto", "Umesto"],
  [" umjesto ", " umesto "],
  ["jedan zahtjev umjesto", "jedan zahtjev umesto"],
  ["umjesto da zovete", "umesto da zovete"],
  ["umjesto da", "umesto da"],
  ["umjesto trajnog", "umesto trajnog"],
  ["umjesto `delete`", "umesto `delete`"],
  ["umjesto client fetcha", "umesto client fetcha"],
  ["umjesto više poziva", "umesto više poziva"],
  ["umjesto starog keša", "umesto starog keša"],
  ["umjesto N.", "umesto N."],
  [" prije odluke", " pre odluke"],
  [" prije dolaska", " pre dolaska"],
  [" prije angažmana", " pre angažmana"],
  [" prije kontakta", " pre kontakta"],
  [" prije nego što", " pre nego što"],
  [" prije punog", " pre punog"],
  [" prije registracije", " pre registracije"],
  [" prije javne objave", " pre javne objave"],
  [" prije početka", " pre početka"],
  [" prije krečenja", " pre krečenja"],
  [" prije namještaja", " pre nameštaja"],
  [" prije dolaska gostiju", " pre dolaska gostiju"],
  [" prije renoviranja", " pre renoviranja"],
  [" prije kupovine", " pre kupovine"],
  [" prije useljenja", " pre useljenja"],
  [" prije praznika", " pre praznika"],
  [" prije čišćenja", " pre čišćenja"],
  [" prije objave", " pre objave"],
  [" prije otključavanja", " pre otključavanja"],
  [" prije slanja", " pre slanja"],
  [" prije logova", " pre logova"],
  [" prije brisanja", " pre brisanja"],
  [" prije safeParse", " pre safeParse"],
  [" prije Zod", " pre Zod"],
  [" prije `$transaction`", " pre `$transaction`"],
  [" prije suite-a", " pre suite-a"],
  [" prije unlock-a", " pre unlock-a"],
  [" prije E2E", " pre E2E"],
  [" prije klijentskog", " pre klijentskog"],
  [" prije svake kupovine", " pre svake kupovine"],
  [" prije nego što odlučite", " pre nego što odlučite"],
  [" prije nego što pozovete", " pre nego što pozovete"],
  [" prije nego što profil", " pre nego što profil"],
  [" prije nego što vam", " pre nego što vam"],
  [" prije nego što bude", " pre nego što bude"],
  [" prije punijeg profila", " pre punijeg profila"],
  [" prije ili poslije sezone", " pre ili posle sezone"],
  [" procijeni", "proceni"],
  [" procijenjuje", "procenjuje"],
  [" zamjenjuje", "zamenjuje"],
  [" zamjenu", "zamenu"],
  [" zamjena", "zamena"],
  ["Zamjena", "Zamena"],
  ["vrijeme", "vreme"],
  ["Vrijeme", "Vreme"],
  ["svijetlo", "svetlo"],
  ["bijelu", "belu"],
  ["bijela", "bela"],
  ["namještaja", "nameštaja"],
  ["vidjeti", "videti"],
  ["Vidjeti", "Videti"],
  ["poslije", "posle"],
  ["Poslije", "Posle"],
  ["primijećeno", "primećeno"],
  ["vjerovatno", "verovatno"],
  ["ljepilo", "lepak"],
  [" ne prilježu", " ne prianjaju"],
  ["prilježu kako", "prianjaju kako"],
  ["doprinijeti", "doprineti"],
  ["primijenjene", "primenjene"],
  ["primijenila", "primenila"],
  ["promijeniti", "promeniti"],
  ["promijenite", "promenite"],
  ["promijene", "promene"],
  ["spriječi", "spreči"],
  ["spriječava", "sprečava"],
  ["zamijeniti", "zameniti"],
  ["Zamijeniti", "Zameniti"],
  ["zamijeni", "zameni"],
  ["Zamijeni", "Zameni"],
  ["promijeni", "promeni"],
  ["Promijeni", "Promeni"],
  ["dijeljeni", "deljeni"],
  ["izmijenite", "izmenite"],
  ["Izmijenite", "Izmenite"],
  ["djelimična", "delimična"],
  ["grijao", "grejao"],
  ["grije", "greje"],
  ["nije grijao", "nije grejao"],
  ["mjerenje", "merenje"],
  ["što prije jer", "što pre jer"],
  ["Jednom prije suite", "Jednom pre suite"],
  ["prije updatea", "pre updatea"],
  ["kad se promijene", "kad se promene"],
  ["Pokušajte promijeniti", "Pokušajte promeniti"],
  ["inicijalne vrijednosti", "inicijalne vrednosti"],
];

PAIRS.sort((a, b) => b[0].length - a[0].length);

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(full, acc);
    } else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith("normalize-sr-me-copy-pass2.js") && !e.name.endsWith(".d.ts")) {
      acc.push(full);
    }
  }
}

const files = [];
walk(ROOT, files);

let changed = 0;
for (const file of files) {
  if (file.replace(/\\/g, "/").includes("scripts/normalize-sr-me-copy")) continue;

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
