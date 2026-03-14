/**
 * Smart matching: score za rangiranje majstora.
 * category match je obavezan (filtriran na API nivou).
 * city nije hard filter - ranking faktor.
 * distance, rating, reviewCount, averageResponseMinutes, verified, promoted.
 */

import { getDistanceBetweenCities } from "./distance";

export type HandymanForScore = {
  city: string | null;
  handymanProfile: {
    ratingAvg: number;
    reviewCount: number;
    verifiedStatus: string;
    averageResponseMinutes?: number | null;
    completedJobsCount?: number;
  };
  isPromoted?: boolean;
};

/**
 * Izračunaj score za majstora. Veći = bolji.
 * distanceKm: 0 = isti grad, veći = dalji
 */
export function calcHandymanScore(
  h: HandymanForScore,
  targetCity: string | null
): number {
  let score = 0;

  // Distance: max 100km daje 0, 0km daje 100
  if (targetCity) {
    const dist = getDistanceBetweenCities(h.city, targetCity);
    score += Math.max(0, 100 - dist);
  } else {
    score += 50; // neutral kada nema grada
  }

  // Rating: 0-5 → 0-50
  score += (h.handymanProfile.ratingAvg ?? 0) * 10;

  // Review count: log scale, cap ~30
  const revCount = h.handymanProfile.reviewCount ?? 0;
  score += Math.min(30, Math.log10(revCount + 1) * 15);

  // Verified bonus
  if (h.handymanProfile.verifiedStatus === "VERIFIED") {
    score += 20;
  }

  // Response time: brži = bolji. 60min = 10, 0min = 20
  const respMin = h.handymanProfile.averageResponseMinutes;
  if (respMin != null) {
    score += Math.max(0, 20 - respMin / 5);
  }

  // Promoted bonus
  if (h.isPromoted) {
    score += 15;
  }

  return Math.round(score * 10) / 10;
}
