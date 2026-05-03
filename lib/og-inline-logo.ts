import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

/**
 * Isti vizuel kao javni header (`PublicHeader`): worker ikona iz `public/brand/worker-cutout-transparent.png`.
 * Tekst „BrziMajstor.ME“ se renderuje u `OgShareCard` kao na sajtu (ne horizontalni PNG brend).
 */
export function getOgSiteHeaderMarkDataUrl(): string {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "brand", "worker-cutout-transparent.png");
  const buf = fs.readFileSync(file);
  cached = `data:image/png;base64,${buf.toString("base64")}`;
  return cached;
}
