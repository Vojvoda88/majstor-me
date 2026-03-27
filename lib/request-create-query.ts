/**
 * Normalizacija query parametara za /request/create (SSR + usklađenost sa Next searchParams kao Promise / string | string[]).
 */
import { getInternalCategory } from "@/lib/categories";
import { CITIES } from "@/lib/constants";

export function firstSearchParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v[0];
  return v;
}

/**
 * Mapira slug / label / dijakritiku kategorije na internal naziv; grad na tačan unos iz CITIES (case-insensitive).
 */
export function parseRequestCreateSearchParams(raw: Record<string, string | string[] | undefined>): {
  initialCategory?: string;
  initialCity?: string;
} {
  const cat = firstSearchParam(raw.category)?.trim();
  const city = firstSearchParam(raw.city)?.trim();

  let initialCategory: string | undefined;
  if (cat) {
    const mapped = getInternalCategory(cat);
    initialCategory = mapped ?? cat;
  }

  let initialCity: string | undefined;
  if (city) {
    initialCity = CITIES.find((c) => c.toLowerCase() === city.toLowerCase());
  }

  return { initialCategory, initialCity };
}
