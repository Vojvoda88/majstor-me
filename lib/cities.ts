/**
 * City coordinates for Montenegro (latitude, longitude).
 * Used for distance calculation (Haversine).
 * Source: GeoNames, approximate for smaller towns.
 */

export type CityCoords = { lat: number; lng: number };

/** City name -> coordinates. Matches CITIES from constants. */
export const CITY_COORDS: Record<string, CityCoords> = {
  Podgorica: { lat: 42.4411, lng: 19.2636 },
  "Nikšić": { lat: 42.7731, lng: 18.9445 },
  Budva: { lat: 42.287, lng: 18.839 },
  Bar: { lat: 42.094, lng: 19.098 },
  "Herceg Novi": { lat: 42.453, lng: 18.538 },
  Cetinje: { lat: 42.391, lng: 18.914 },
  Kotor: { lat: 42.426, lng: 18.771 },
  Tivat: { lat: 42.436, lng: 18.694 },
  Ulcinj: { lat: 41.929, lng: 19.224 },
  "Bijelo Polje": { lat: 43.038, lng: 19.748 },
  Berane: { lat: 42.843, lng: 19.873 },
  Pljevlja: { lat: 43.357, lng: 19.358 },
  "Rožaje": { lat: 42.833, lng: 20.167 },
  Danilovgrad: { lat: 42.554, lng: 19.146 },
  Mojkovac: { lat: 42.96, lng: 19.583 },
  "Kolašin": { lat: 42.824, lng: 19.518 },
  "Žabljak": { lat: 43.154, lng: 19.123 },
  Plav: { lat: 42.597, lng: 19.945 },
  Andrijevica: { lat: 42.736, lng: 19.792 },
  "Šavnik": { lat: 42.956, lng: 19.096 },
  "Plužine": { lat: 43.153, lng: 18.839 },
  Gusinje: { lat: 42.562, lng: 19.834 },
  Tuzi: { lat: 42.366, lng: 19.331 },
};

export const DEFAULT_COORDS: CityCoords = { lat: 42.4411, lng: 19.2636 };

export function getCityCoords(cityName: string): CityCoords {
  return CITY_COORDS[cityName] ?? DEFAULT_COORDS;
}
