/**
 * Generate PWA icons: public/icon-192.png and public/icon-512.png
 * Run: node scripts/generate-pwa-icons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const THEME_COLOR = "#2563EB";

async function createIcon(size) {
  const half = size / 2;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${THEME_COLOR}" rx="${size * 0.12}"/>
      <text x="50%" y="55%" font-family="Arial,sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">M</text>
    </svg>
  `;
  return sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(PUBLIC, `icon-${size}.png`));
}

async function main() {
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
  await createIcon(192);
  await createIcon(512);
  console.log("Created public/icon-192.png and public/icon-512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
