/**
 * Server-only data za homepage.
 * Koristi se u app/page.tsx umjesto client fetcha – omogućuje ISR/cache bez force-dynamic.
 */

import { getDistanceBetweenCities } from "@/lib/distance";
import { calcHandymanScore } from "@/lib/handyman-score";

export type PlatformStats = {
  handymanCount: number | null;
  avgRating: number | null;
  citiesCount: number;
};

export type HomeHandyman = {
  id: string;
  name: string | null;
  city: string | null;
  categories: string[];
  ratingAvg: number;
  reviewCount: number;
  avatarUrl?: string | null;
  verifiedStatus?: string;
};

const MAX_HANDYMEN_FOR_HOMEPAGE = 50;

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const { prisma } = await import("@/lib/db");
    const [handymanCount, completedCount, reviewAgg, citiesRows] = await Promise.all([
      prisma.handymanProfile.count(),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
      prisma.request.findMany({ select: { city: true }, distinct: ["city"] }),
    ]);
    const avgRating = reviewAgg._avg.rating ?? 0;
    const reviewCount = reviewAgg._count;
    const hasEnoughData = handymanCount > 0 || completedCount > 0 || reviewCount > 0;
    return {
      handymanCount: hasEnoughData ? handymanCount : null,
      avgRating: hasEnoughData && reviewCount > 0 ? Math.round(avgRating * 10) / 10 : null,
      citiesCount: citiesRows.length,
    };
  } catch {
    return { handymanCount: null, avgRating: null, citiesCount: 0 };
  }
}

export async function getTopHandymenForHome(limit: number = 3): Promise<HomeHandyman[]> {
  try {
    const { prisma } = await import("@/lib/db");
    const users = await prisma.user.findMany({
      where: {
        role: "HANDYMAN",
        bannedAt: null,
        suspendedAt: null,
        handymanProfile: {
          workerStatus: "ACTIVE",
        },
      },
      include: {
        handymanProfile: {
          include: { workerCategories: { include: { category: true } } },
        },
      },
      take: MAX_HANDYMEN_FOR_HOMEPAGE,
    });

    const withProfile = users.filter((u) => u.handymanProfile) as {
      id: string;
      name: string | null;
      city: string | null;
      handymanProfile: NonNullable<(typeof users)[0]["handymanProfile"]>;
    }[];

    const profileExt = (p: unknown) =>
      p as { averageResponseMinutes?: number | null; completedJobsCount?: number; isPromoted?: boolean };

    const withScore = withProfile.map((u) => {
      const prof = u.handymanProfile!;
      return {
        ...u,
        _score: calcHandymanScore(
          {
            city: u.city,
            handymanProfile: {
              ratingAvg: prof.ratingAvg,
              reviewCount: prof.reviewCount,
              verifiedStatus: prof.verifiedStatus,
              averageResponseMinutes: profileExt(prof).averageResponseMinutes,
              completedJobsCount: profileExt(prof).completedJobsCount,
            },
            isPromoted: profileExt(prof).isPromoted,
          },
          null
        ),
      };
    });

    withScore.sort((a, b) => b._score - a._score);
    const top = withScore.slice(0, limit);

    return top.map((u) => {
      const prof = u.handymanProfile!;
      const workerCats = (prof as { workerCategories?: { category: { name: string } }[] }).workerCategories;
      return {
        id: u.id,
        name: u.name,
        city: u.city,
        categories: workerCats?.map((wc) => wc.category.name) ?? [],
        ratingAvg: prof.ratingAvg ?? 0,
        reviewCount: prof.reviewCount ?? 0,
        avatarUrl: (prof as { avatarUrl?: string }).avatarUrl ?? null,
        verifiedStatus: prof.verifiedStatus ?? "PENDING",
      };
    });
  } catch {
    return [];
  }
}
