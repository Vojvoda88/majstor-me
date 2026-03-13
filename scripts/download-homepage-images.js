#!/usr/bin/env node
/**
 * Download homepage images to public/images/
 * Run: node scripts/download-homepage-images.js
 *
 * Uses Pexels and Unsplash (free images only, no Unsplash+).
 * URLs: Pexels: images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg
 *       Unsplash: images.unsplash.com/photo-{id}?w=800&q=85
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const PUBLIC = path.join(__dirname, "..", "public", "images");

// Hero: handyman/electrician drilling or fixing in apartment
const HERO = {
  "hero-handyman.jpg":
    "https://images.pexels.com/photos/5974054/pexels-photo-5974054.jpeg", // handyman drilling
};

// Categories: plumber, electrician, tiles, painter, etc.
// Mix of Pexels (numeric ID) and Unsplash (photo-{id}) - all free
const CATEGORIES = {
  "plumber.jpg":
    "https://images.pexels.com/photos/8486978/pexels-photo-8486978.jpeg", // plumber fixing sink
  "electrician.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=85", // electrician outlet
  "tiles.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85", // tile bathroom
  "painter.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85", // painter wall roller
  "carpenter.jpg":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=85", // carpenter woodworking
  "locksmith.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=85", // locksmith/door
  "parquet.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85", // parquet floor
  "ac-technician.jpg":
    "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=85", // AC installation
  "boiler.jpg":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=85", // boiler repair
  "washing-machine.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85", // washing machine
  "refrigerator.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85", // fridge repair
  "oven.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85", // oven repair
  "electronics.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=85", // electronics repair
  "laptop-repair.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=85", // laptop repair
  "security-camera.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=85", // security camera
  "handyman.jpg":
    "https://images.pexels.com/photos/8487735/pexels-photo-8487735.jpeg", // handyman drilling
  "furniture-assembly.jpg":
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=85", // furniture assembly
  "kitchen-installation.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85", // kitchen cabinets
  "cleaning.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85", // house cleaning
  "upholstery-cleaning.jpg":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=85", // sofa cleaning
  "movers.jpg":
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&q=85", // movers boxes
  "gardener.jpg":
    "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=85", // gardener hedge
  "blinds.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85", // blinds installation
  "solar-panels.jpg":
    "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=85", // solar panels
  "fasade.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85", // facade
  "construction.jpg":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=85", // construction
  "tv-install.jpg":
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=85", // TV install
  "plaster.jpg":
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=85", // plaster
  "moisture.jpg":
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=85", // moisture
  "waste.jpg":
    "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&q=85", // waste
  "emergency-locksmith.jpg":
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=85", // emergency locksmith
};

// Cities: Montenegro
const CITIES = {
  "podgorica.jpg":
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=85",
  "niksic.jpg":
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85",
  "budva.jpg":
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&q=85",
  "bar.jpg":
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=800&q=85",
  "kotor.jpg":
    "https://images.unsplash.com/photo-1623457813330-9970000bc91d?w=800&q=85",
  "herceg-novi.jpg":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=85",
  "tivat.jpg":
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85",
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
  console.log("Downloading homepage images to public/images/...\n");

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
