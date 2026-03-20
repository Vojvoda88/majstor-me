import { NextResponse } from "next/server";

export const revalidate = 60;

/**
 * Platform statistike za homepage trust sekciju.
 * Vraća null za vrijednosti ako nema dovoljno podataka (fallback bez lažnog prikaza).
 */
export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");

    const [handymanCount, completedCount, reviewAgg, requestCount, userCount] = await Promise.all([
      prisma.handymanProfile.count(),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.review.aggregate({
        _avg: { rating: true },
        _count: true,
      }),
      prisma.request.count(),
      prisma.user.count({ where: { role: "USER", bannedAt: null } }),
    ]);

    const avgRating = reviewAgg._avg.rating ?? 0;
    const reviewCount = reviewAgg._count;

    // Samo ako imamo smislene podatke
    const hasEnoughData = handymanCount > 0 || completedCount > 0 || reviewCount > 0;

    const [cities, hmCities, categories] = await Promise.all([
      prisma.request.findMany({
        select: { city: true },
        distinct: ["city"],
      }),
      prisma.user.findMany({
        where: { role: "HANDYMAN", city: { not: null } },
        select: { city: true },
        distinct: ["city"],
      }),
      prisma.request.findMany({
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    const citySet = new Set<string>();
    for (const c of cities) {
      if (c.city) citySet.add(c.city);
    }
    for (const u of hmCities) {
      if (u.city) citySet.add(u.city);
    }

    return NextResponse.json({
      userCount: hasEnoughData ? userCount : null,
      handymanCount: hasEnoughData ? handymanCount : null,
      completedJobsCount: hasEnoughData ? completedCount : null,
      avgRating: hasEnoughData && reviewCount > 0 ? Math.round(avgRating * 10) / 10 : null,
      reviewCount: hasEnoughData ? reviewCount : null,
      citiesCount: citySet.size,
      categoriesCount: categories.length,
      requestCount: hasEnoughData ? requestCount : null,
    });
  } catch {
    return NextResponse.json({
      userCount: null,
      handymanCount: null,
      completedJobsCount: null,
      avgRating: null,
      reviewCount: null,
      citiesCount: 0,
      categoriesCount: 0,
      requestCount: null,
    });
  }
}
