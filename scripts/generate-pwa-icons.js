/**
 * PWA ikone: public/icon-192.png i public/icon-512.png
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

const PUBLIC = path.join(__dirname, "..", "public");
const SOURCE_OUT = path.join(PUBLIC, "pwa-icon-source.png");
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
  await sharp(SOURCE_OUT)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, `icon-${size}.png`));
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
  console.log("Gotovo: public/icon-192.png i public/icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
