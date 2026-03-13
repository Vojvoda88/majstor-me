#!/usr/bin/env node
/**
 * Download homepage images to /public/images
 * Run: node scripts/download-images.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const PUBLIC = path.join(__dirname, "..", "public", "images");

// Hero: handyman actually repairing (plumber fixing pipe - hands on work)
const HERO = {
  "hero.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&q=90", // plumber repairing with tools
};

// Categories: specific job images (plumber, electrician, carpenter, etc.)
const CATEGORIES = {
  "vodoinstalater.jpg":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=85",
  "elektricar.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=85",
  "keramicar.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  "klima-servis.jpg":
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=85",
  "moler-gipsar.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=85",
  "stolar.jpg":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=85",
  "bravar.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=85",
  "parketar.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  "fasade-izolacija.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=85",
  "gradjevinski-radovi.jpg":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=85",
  "servis-bojlera.jpg":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=85",
  "servis-ves-masina.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=85",
  "servis-frizidera.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=85",
  "servis-sporeta-rerne.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=85",
  "servis-elektronike.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=85",
  "servis-racunara-laptopa.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=85",
  "tv-antene-internet.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=85",
  "montaza-namjestaja.jpg":
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=85",
  "ugradnja-kuhinja.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  "ciscenje.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=85",
  "dubinsko-ciscenje.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=85",
  "selidbe.jpg":
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&q=85",
  "dvoriste-basta.jpg":
    "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&q=85",
  "roletne-tende.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  "sitne-kucne-popravke.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=85",
  "alarm-video-nadzor.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=85",
  "brave-hitna-otvaranja.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=85",
  "solarni-sistemi.jpg":
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=85", // solar panels
  "gipsani-radovi.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=85",
  "sanacija-vlage.jpg":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=85",
  "odvoz-suta-otpada.jpg":
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&q=85",
  "moler-sitne-kucne.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=85",
};

// Montenegro cities - Unsplash (Kotor, Budva, Bar) + Pexels/Pixabay-style fallbacks
// Using verified Unsplash Montenegro photos
const CITIES = {
  "podgorica.jpg":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=85", // Montenegro capital
  "niksic.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85", // mountain town
  "budva.jpg":
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=85", // Budva coast
  "bar.jpg":
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&q=85", // port
  "kotor.jpg":
    "https://images.unsplash.com/photo-1623457813330-9970000bc91d?w=800&q=85", // Kotor bay Montenegro
  "herceg-novi.jpg":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85", // coastal
  "tivat.jpg":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85", // marina
  "cetinje.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "ulcinj.jpg":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85",
  "bijelo-polje.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "berane.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "pljevlja.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "danilovgrad.jpg":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=85",
  "kolasin.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "zabljak.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
};

function getProtocol(url) {
  return url.startsWith("https") ? https : http;
}

function download(url) {
  return new Promise((resolve, reject) => {
    getProtocol(url)
      .get(url, { headers: { "User-Agent": "MajstorMe/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function save(dir, filename, url) {
  const dirPath = path.join(PUBLIC, dir);
  fs.mkdirSync(dirPath, { recursive: true });
  const filepath = path.join(dirPath, filename);
  try {
    const buf = await download(url);
    fs.writeFileSync(filepath, buf);
    console.log(`  ✓ ${dir}/${filename}`);
  } catch (err) {
    console.error(`  ✗ ${dir}/${filename}: ${err.message}`);
  }
}

async function main() {
  console.log("Downloading images to public/images/...\n");

  console.log("Hero:");
  for (const [file, url] of Object.entries(HERO)) {
    await save("hero", file, url);
  }

  console.log("\nCategories:");
  for (const [file, url] of Object.entries(CATEGORIES)) {
    await save("categories", file, url);
  }

  console.log("\nCities:");
  for (const [file, url] of Object.entries(CITIES)) {
    await save("cities", file, url);
  }

  console.log("\nDone.");
}

main().catch(console.error);
