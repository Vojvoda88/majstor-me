/**
 * Smart distribution za zahtjeve.
 * - category match je obavezan
 * - city je ranking signal, ne hard filter
 * - distance, verified, rating, reviewCount, response time, activity, premium utiču na score
 * - top N majstora dobijaju email/notification; svi relevantni vide u dashboardu
 */

import { calcHandymanScore, type HandymanForScore } from "./handyman-score";

export const SMART_DISTRIBUTION_CONFIG = {
  /** Broj majstora koji dobijaju email/notification odmah */
  TOP_N_NOTIFY: parseInt(process.env.SMART_DISTRIBUTION_TOP_N ?? "20", 10) || 20,
  /** true = samo top N dobijaju notifikaciju; false = broadcast svima (fallback) */
  ENABLED: process.env.SMART_DISTRIBUTION_ENABLED !== "false",
};

export type HandymanForDistribution = {
  id: string;
  city: string | null;
  handymanProfile: {
    ratingAvg: number;
    reviewCount: number;
    verifiedStatus: string;
    averageResponseMinutes?: number | null;
    completedJobsCount?: number;
    availabilityStatus?: string | null;
  };
  isPromoted?: boolean;
};

/**
 * Sortira majstore po score-u za target grad.
 * Vraća sve (za dashboard) i top N (za notifikaciju).
 */
export function rankHandymenForRequest(
  handymen: HandymanForDistribution[],
  targetCity: string | null
): { ranked: HandymanForDistribution[]; topForNotify: HandymanForDistribution[] } {
  const forScore: HandymanForScore[] = handymen.map((h) => ({
    city: h.city,
    handymanProfile: {
      ratingAvg: h.handymanProfile.ratingAvg,
      reviewCount: h.handymanProfile.reviewCount,
      verifiedStatus: h.handymanProfile.verifiedStatus,
      averageResponseMinutes: h.handymanProfile.averageResponseMinutes,
      completedJobsCount: h.handymanProfile.completedJobsCount,
    },
    isPromoted: h.isPromoted,
  }));

  const withScore = handymen.map((h, i) => ({
    handyman: h,
    score: calcHandymanScore(forScore[i], targetCity),
  }));

  withScore.sort((a, b) => b.score - a.score);
  const ranked = withScore.map((w) => w.handyman);
  const topN = SMART_DISTRIBUTION_CONFIG.TOP_N_NOTIFY;
  const topForNotify = ranked.slice(0, topN);

  return { ranked, topForNotify };
}
