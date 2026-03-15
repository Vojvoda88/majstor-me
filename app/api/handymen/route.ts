import { NextRequest, NextResponse } from "next/server";
import { getInternalCategory } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getCityCoords } from "@/lib/cities";
import { getDistanceBetweenCities } from "@/lib/distance";
import { calcHandymanScore } from "@/lib/handyman-score";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const MAX_HANDYMEN_LOAD = 200;
const MAX_PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const searchParams = req.nextUrl?.searchParams ?? new URLSearchParams();
    const categoryParam = searchParams.get("category");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10)));

    const category = categoryParam ? (getInternalCategory(categoryParam) ?? categoryParam) : null;
    const baseWhere = {
      role: "HANDYMAN" as const,
      bannedAt: null,
      suspendedAt: null,
      handymanProfile: {
        workerStatus: "ACTIVE" as const,
        ...(category && {
          workerCategories: {
            some: { category: { name: category } },
          },
        }),
      },
    };

    const profileExt = (p: unknown) => p as { averageResponseMinutes?: number | null; completedJobsCount?: number; isPromoted?: boolean };

    const useDbPagination = !city && (sortBy === "rating" || sortBy === "reviews");
    let items: Awaited<ReturnType<typeof prisma.user.findMany>>;
    let total: number;

    if (useDbPagination) {
      const orderByKey = sortBy === "reviews" ? "reviewCount" : "ratingAvg";
      const [users, count] = await Promise.all([
        prisma.user.findMany({
          where: baseWhere,
          include: {
            handymanProfile: {
              include: { workerCategories: { include: { category: true } } },
            },
          },
          orderBy: { handymanProfile: { [orderByKey]: "desc" } },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({
          where: baseWhere,
        }),
      ]);
      items = users.filter((u) => u.handymanProfile);
      total = count;
    } else {
      const handymen = await prisma.user.findMany({
        where: baseWhere,
        include: {
          handymanProfile: {
            include: { workerCategories: { include: { category: true } } },
          },
        },
        take: MAX_HANDYMEN_LOAD,
      });

      const filtered = handymen.filter((u) => u.handymanProfile);
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
        };
      });
      withScore.sort((a, b) => b._score - a._score);
      total = withScore.length;
      const offset = (page - 1) * limit;
      items = withScore.slice(offset, offset + limit) as typeof handymen;
    }

    const totalPages = Math.ceil(total / limit) || 1;

    type UserWithProfile = { id: string; name: string | null; city: string | null; handymanProfile: NonNullable<Awaited<ReturnType<typeof prisma.user.findMany>>[number]["handymanProfile"]> & { workerCategories?: { category: { name: string } }[] } };
    const mapItem = (u: UserWithProfile) => {
      const prof = u.handymanProfile;
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
