/**
 * Distance calculation using Haversine formula.
 * Returns distance in kilometers between two points on Earth.
 */

import { getCityCoords, type CityCoords } from "./cities";

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula - distance between two lat/lng points in km.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distance between two cities by name. Uses city coordinates.
 * Returns km, or 0 if same city / both unknown.
 */
export function getDistanceBetweenCities(
  cityA: string | null | undefined,
  cityB: string | null | undefined
): number {
  if (!cityA || !cityB || cityA === cityB) return 0;
  const a = getCityCoords(cityA);
  const b = getCityCoords(cityB);
  return haversineKm(a.lat, a.lng, b.lat, b.lng);
}

/**
 * Distance from a point to a city.
 */
export function getDistanceFromPointToCity(
  lat: number,
  lng: number,
  cityName: string
): number {
  const city = getCityCoords(cityName);
  return haversineKm(lat, lng, city.lat, city.lng);
}
