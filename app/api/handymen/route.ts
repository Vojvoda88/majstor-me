import { NextRequest, NextResponse } from "next/server";
import { getInternalCategory } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getCityCoords } from "@/lib/cities";
import { getDistanceBetweenCities } from "@/lib/distance";
import { calcHandymanScore } from "@/lib/handyman-score";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const searchParams = req.nextUrl?.searchParams ?? new URLSearchParams();
    const categoryParam = searchParams.get("category");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10)));

    // Resolve category: slug/displayName -> internal category
    const category = categoryParam ? (getInternalCategory(categoryParam) ?? categoryParam) : null;

    const handymen = await prisma.user.findMany({
      where: {
        role: "HANDYMAN",
        ...(category && {
          handymanProfile: {
            workerCategories: {
              some: { category: { name: category } },
            },
          },
        }),
      },
      include: {
        handymanProfile: {
          include: { workerCategories: { include: { category: true } } },
        },
      },
    });

    let filtered = handymen.filter((u) => u.handymanProfile);

    const profileExt = (p: unknown) => p as { averageResponseMinutes?: number | null; completedJobsCount?: number; isPromoted?: boolean };

    const withScore = filtered.map((u) => {
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
          city
        ),
        _distance: city ? getDistanceBetweenCities(u.city, city) : null,
      };
    });

    if (city || sortBy === "rating" || sortBy === "reviews") {
      withScore.sort((a, b) => b._score - a._score);
    }

    filtered = withScore;

    const total = withScore.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const items = withScore.slice(offset, offset + limit);

    const mapItem = (u: (typeof withScore)[0]) => {
      const prof = u.handymanProfile!;
      const ext = profileExt(prof);
      const city = u.city;
      const coords = city ? getCityCoords(city) : null;
      return {
        id: u.id,
        name: u.name,
        city: u.city,
        categories:
          (prof as { workerCategories?: { category: { name: string } }[] }).workerCategories?.map(
            (wc) => wc.category.name
          ) ?? [],
        ratingAvg: prof.ratingAvg ?? 0,
        reviewCount: prof.reviewCount ?? 0,
        avatarUrl: (prof as { avatarUrl?: string }).avatarUrl ?? null,
        verifiedStatus: prof.verifiedStatus ?? "PENDING",
        completedJobsCount: ext.completedJobsCount ?? 0,
        averageResponseMinutes: ext.averageResponseMinutes ?? null,
        availabilityStatus: (prof as { availabilityStatus?: string }).availabilityStatus ?? null,
        isPromoted: ext.isPromoted ?? false,
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      };
    };

    return NextResponse.json({
      items: items.map(mapItem),
      total,
      page,
      totalPages,
      handymen: items.map(mapItem),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch handymen" },
      { status: 500 }
    );
  }
}
