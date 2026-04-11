/**
 * Server-only data za homepage.
 * Koristi se u app/page.tsx umjesto client fetcha – omogućuje ISR/cache bez force-dynamic.
 */

import { calcHandymanScore } from "@/lib/handyman-score";
import { prismaWhereUserActiveHandymanForPublicCatalog } from "@/lib/handyman-truth";

export type PlatformStats = {
  /** Registrovani klijenti (role USER) */
  userCount: number | null;
  handymanCount: number | null;
  avgRating: number | null;
  /** Distinktni gradovi iz zahtjeva + majstora (realniji coverage od samo zahtjeva) */
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
    const [handymanCount, completedCount, reviewAgg, citiesRows, hmCitiesRows, userCount] = await Promise.all([
      prisma.user.count({ where: prismaWhereUserActiveHandymanForPublicCatalog() }),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
      prisma.request.findMany({ select: { city: true }, distinct: ["city"] }),
      prisma.user.findMany({
        where: { ...prismaWhereUserActiveHandymanForPublicCatalog(), city: { not: null } },
        select: { city: true },
        distinct: ["city"],
      }),
      prisma.user.count({ where: { role: "USER", bannedAt: null } }),
    ]);
    const avgRating = reviewAgg._avg.rating ?? 0;
    const reviewCount = reviewAgg._count;
    const hasEnoughData = handymanCount > 0 || completedCount > 0 || reviewCount > 0;
    const citySet = new Set<string>();
    for (const r of citiesRows) {
      if (r.city) citySet.add(r.city);
    }
    for (const u of hmCitiesRows) {
      if (u.city) citySet.add(u.city);
    }
    return {
      userCount: hasEnoughData ? userCount : null,
      handymanCount: hasEnoughData ? handymanCount : null,
      avgRating: hasEnoughData && reviewCount > 0 ? Math.round(avgRating * 10) / 10 : null,
      citiesCount: citySet.size,
    };
  } catch {
    return { userCount: null, handymanCount: null, avgRating: null, citiesCount: 0 };
  }
}

export async function getTopHandymenForHome(limit: number = 3): Promise<HomeHandyman[]> {
  try {
    const { prisma } = await import("@/lib/db");
    const users = await prisma.user.findMany({
      where: prismaWhereUserActiveHandymanForPublicCatalog(),
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
