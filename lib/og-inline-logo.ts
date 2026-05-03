import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

/**
 * Učitava horizontalni brend logo iz `public/` kao data URL — bez mrežnog fetcha u Edge/OG,
 * da pregled linka uvijek dobije istu grafiku kao na disku.
 */
export function getOgHorizontalLogoDataUrl(): string {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "brand", "brzimajstor-logo-horizontal-user.png");
  const buf = fs.readFileSync(file);
  cached = `data:image/png;base64,${buf.toString("base64")}`;
  return cached;
}
