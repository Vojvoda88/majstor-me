/**
 * PWA ikone: public/icon-192.png/icon-512.png + launcher-icon-192/512.png
 *
 * Izvor u public/ (bilo koje ime — ne moraš preimenovati):
 *   pwa-icon-raw.png | .jpg | .jpeg | pwa-icon-raw.png.jpg (kad Windows doda .jpg)
 * Ako ih ima više, uzima se najnoviji po datumu izmjene.
 * Opcionalno: npm run icons:generate -- "C:\put\do\bilo-koje.png"
 *
 * Koraci: trim bijelog ruba → kvadrat 1024×1024 (#0F172A pozadina) → downscale Lanczos.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PUBLIC = path.join(__dirname, "..", "public");
const SOURCE_OUT = path.join(PUBLIC, "pwa-icon-source.png");
const LIB_PWA_ICON_ASSETS = path.join(__dirname, "..", "lib", "pwa-icon-assets.ts");
const SW_PATH = path.join(PUBLIC, "sw.js");
/** Poznata imena; redoslijed samo za “jednaki” timestamp — inače pobjeđuje najnoviji fajl. */
const RAW_NAMES = [
  "pwa-icon-raw.png",
  "pwa-icon-raw.jpg",
  "pwa-icon-raw.jpeg",
  "pwa-icon-raw.png.jpg",
];
const BG = { r: 15, g: 23, b: 42, alpha: 1 }; // #0F172A
const MASTER = 1024;

function parseArgPath() {
  const a = process.argv[2];
  if (!a || a.startsWith("-")) return null;
  return path.resolve(a);
}

/** Pronađi raw u public/ bez ručnog preimenovanja. */
function findRawInPublic() {
  let best = null;
  let bestMtime = -1;
  for (const name of RAW_NAMES) {
    const full = path.join(PUBLIC, name);
    if (!fs.existsSync(full)) continue;
    const m = fs.statSync(full).mtimeMs;
    if (m >= bestMtime) {
      bestMtime = m;
      best = full;
    }
  }
  return best;
}

async function buildMasterFromRaw(rawPath) {
  const buf = await sharp(rawPath)
    .trim({ threshold: 35 })
    .resize(MASTER, MASTER, {
      fit: "contain",
      position: "centre",
      background: BG,
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await fs.promises.writeFile(SOURCE_OUT, buf);
}

async function resizeToIcon(size) {
  const out = path.join(PUBLIC, `icon-${size}.png`);
  await sharp(SOURCE_OUT)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(out);
  fs.copyFileSync(out, path.join(PUBLIC, `launcher-icon-${size}.png`));
}

function createVersionTag() {
  const icon512 = fs.readFileSync(path.join(PUBLIC, "icon-512.png"));
  const hash = crypto.createHash("sha1").update(icon512).digest("hex").slice(0, 8);
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hash}`;
}

function updatePwaVersionInFiles(versionTag) {
  if (!fs.existsSync(LIB_PWA_ICON_ASSETS)) {
    throw new Error(`Nedostaje fajl: ${LIB_PWA_ICON_ASSETS}`);
  }
  if (!fs.existsSync(SW_PATH)) {
    throw new Error(`Nedostaje fajl: ${SW_PATH}`);
  }

  const libSrc = fs.readFileSync(LIB_PWA_ICON_ASSETS, "utf8");
  const libPattern = /export const PWA_ICON_CACHE_VERSION = ".*?";/;
  if (!libPattern.test(libSrc)) {
    throw new Error("Nije pronađen PWA_ICON_CACHE_VERSION u lib/pwa-icon-assets.ts");
  }
  const libUpdated = libSrc.replace(
    libPattern,
    `export const PWA_ICON_CACHE_VERSION = "${versionTag}";`
  );
  fs.writeFileSync(LIB_PWA_ICON_ASSETS, libUpdated, "utf8");

  const swSrc = fs.readFileSync(SW_PATH, "utf8");
  const swIconPattern = /const ICON_192 = "\/launcher-icon-192\.png\?v=.*?";/;
  const swCachePattern = /const CACHE_NAME = "majstor-me-v.*?";/;
  if (!swIconPattern.test(swSrc) || !swCachePattern.test(swSrc)) {
    throw new Error("Nije pronađen ICON_192 ili CACHE_NAME u public/sw.js");
  }
  let swUpdated = swSrc.replace(
    swIconPattern,
    `const ICON_192 = "/launcher-icon-192.png?v=${versionTag}";`
  );
  swUpdated = swUpdated.replace(
    swCachePattern,
    `const CACHE_NAME = "majstor-me-v${versionTag}";`
  );
  fs.writeFileSync(SW_PATH, swUpdated, "utf8");
}

async function main() {
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });

  const cliRaw = parseArgPath();
  const rawPath = cliRaw ?? findRawInPublic();

  if (rawPath) {
    if (!fs.existsSync(rawPath)) {
      console.error(`Nema fajla: ${rawPath}`);
      process.exit(1);
    }
    await buildMasterFromRaw(rawPath);
    console.log(`Master: ${rawPath} → ${SOURCE_OUT}`);
  }

   if (!fs.existsSync(SOURCE_OUT)) {
    console.error(
      "Nema public/pwa-icon-source.png. U public/ stavite jedan od: " +
        RAW_NAMES.join(", ") +
        ' pa npm run icons:generate (ili putanju: npm run icons:generate -- "C:\\slika.png")'
    );
    process.exit(1);
  }

  await resizeToIcon(192);
  await resizeToIcon(512);
  const versionTag = createVersionTag();
  updatePwaVersionInFiles(versionTag);
  console.log("Gotovo: public/icon-192.png i public/icon-512.png");
  console.log(`PWA verzija ikonica ažurirana: ${versionTag}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
