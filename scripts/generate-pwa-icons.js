/**
 * Generate PWA icons: public/icon-192.png and public/icon-512.png
 * from public/pwa-icon-source.png (replace source, then run).
 * Run: npm run icons:generate
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SOURCE = path.join(PUBLIC, "pwa-icon-source.png");

async function resizeToIcon(size) {
  const pipeline = sharp(SOURCE)
    .resize(size, size, {
      fit: "cover",
      position: "centre",
    })
    .png();

  await pipeline.toFile(path.join(PUBLIC, `icon-${size}.png`));
}

async function main() {
  if (!fs.existsSync(PUBLIC)) fs.mkdirSync(PUBLIC, { recursive: true });
  if (!fs.existsSync(SOURCE)) {
    console.error(
      "Missing public/pwa-icon-source.png — add a square PNG (1024×1024 recommended), then run again."
    );
    process.exit(1);
  }
  await resizeToIcon(192);
  await resizeToIcon(512);
  console.log("Created public/icon-192.png and public/icon-512.png from pwa-icon-source.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
