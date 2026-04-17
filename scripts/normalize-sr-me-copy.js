/**
 * Normalizacija teksta u .ts/.tsx: hrvatski → srpsko-crnogorski (ekavski) oblici.
 *
 * PAŽNJA: projekat sada koristi ijekavski pravopis u UI-ju — za taj smjer pokreni
 * `node scripts/normalize-ijekavian-copy.js`. Ovu skriptu ne pokretati ako želiš
 * zadržati ocjena/provjera/umjesto itd.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", "dist", "build", ".git", "playwright-report", "test-results"]);

const PAIRS = [
  ["Dobrodošli natrag", "Dobrodošli nazad"],
  ["preusmjerit ćemo", "preusmerićemo"],
  ["Greška pri provjeri", "Greška pri proveri"],
  ["Provjera obavještenja", "Provera obavještenja"],
  ["Nakon kratke provjere", "Nakon kratke provere"],
  ["Sortiraj po ocjeni", "Sortiraj po oceni"],
  ["za servis ili provjeru klime", "za servis ili proveru klime"],
  ["sigurnosnu provjeru", "sigurnosnu proveru"],
  ["provjeru instalacije", "proveru instalacije"],
  ["provjeru pritiska", "proveru pritiska"],
  ["provjeru klime", "proveru klime"],
  ["detaljnija provjera", "detaljnija provera"],
  ["od provjere majstora", "od provere majstora"],
  ["Provjerava da li", "Proverava da li"],
  ["Provjera da li", "Provera da li"],
  ["Provjera magic", "Provera magic"],
  ["za unit provjere", "za unit provere"],
  ["Besplatna procjena", "Besplatna procena"],
  ["besplatnu procjenu", "besplatnu procenu"],
  ["Koristite admin panel", "Koristite administraciju"],
  ["provjerenih", "proverenih"],
  ["Provjereni", "Provereni"],
  ["provjeravamo", "proveravamo"],
  ["Provjerite", "Proverite"],
  ["Provjeri ručno", "Proveri ručno"],
  ["Provjera", "Provera"],
  ["provjerite", "proverite"],
  ["provjerava", "proverava"],
  ["provjeri", "proveri"],
  ["provjere", "provere"],
  ["provjeru", "proveru"],
  ["provjera", "provera"],
  ["Odaberite", "Izaberite"],
  ["Odaberi", "Izaberi"],
  ["odaberite", "izaberite"],
  ["odaberi", "izaberi"],
  ["odabere", "izabere"],
  ["mjesec", "mesec"],
  ["Mjesec", "Mesec"],
  ["uvijek", "uvek"],
  ["Uvijek", "Uvek"],
  ["još uvijek", "još uvek"],
  ["Još uvijek", "Još uvek"],
  ["ovdje", "ovde"],
  ["Ovdje", "Ovde"],
  ["uspješno", "uspešno"],
  ["Uspješno", "Uspešno"],
  ["uspješne", "uspešne"],
  ["uspješni", "uspešni"],
  ["neuspjeli", "neuspešni"],
  ["dovršeno", "završeno"],
  ["Dovršeno", "Završeno"],
  ["dovrši", "završi"],
  ["Dovrši", "Završi"],
  ["ocjenama", "ocenama"],
  ["Po ocjeni", "Po oceni"],
  ["po ocjeni", "po oceni"],
  ["ocjeni", "oceni"],
  ["ocjene", "ocene"],
  ["ocjenu", "ocenu"],
  ["ocjena", "ocena"],
  ["Ocjena", "Ocena"],
  ["prosječna", "prosečna"],
  ["Prosječna", "Prosečna"],
  ["procjenjuje", "procenjuje"],
  ["procjeni", "proceni"],
  ["procjenu", "procenu"],
  ["procjene", "procene"],
  ["procjena", "procena"],
  ["Procjena", "Procena"],
  ["primijetili", "primetili"],
  ["mijenjan", "menjan"],
  ["zagrijana", "zagrejana"],
  ["zagrijan", "zagrejan"],
  ["vjeruj", "veruj"],
  ["Gdje ", "Gde "],
  [" gdje", " gde"],
  ["(gdje ", "(gde "],
  ["; gdje", "; gde"],
  [", gdje", ", gde"],
];

PAIRS.sort((a, b) => b[0].length - a[0].length);

function walk(dir, acc) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name)) continue;
      walk(full, acc);
    } else if (/\.(tsx|ts)$/.test(e.name) && !e.name.endsWith(".d.ts")) {
      acc.push(full);
    }
  }
}

const files = [];
walk(ROOT, files);

let changed = 0;
for (const file of files) {
  if (file.replace(/\\/g, "/").endsWith("scripts/normalize-sr-me-copy.js")) continue;

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

console.log(`\nUkupno fajlova: ${changed}`);
