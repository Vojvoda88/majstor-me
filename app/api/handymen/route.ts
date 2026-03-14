import { NextRequest, NextResponse } from "next/server";
import { getInternalCategory } from "@/lib/categories";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getDistanceBetweenCities } from "@/lib/distance";

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
            categories: { has: category },
          },
        }),
      },
      include: { handymanProfile: true },
    });

    let filtered = handymen.filter((u) => u.handymanProfile);

    // When city provided: sort by distance (closest first). No city filter - svi majstori kategorije.
    if (city) {
      filtered = filtered
        .map((u) => ({
          ...u,
          _distance: getDistanceBetweenCities(u.city, city),
        }))
        .sort((a, b) => (a._distance ?? 9999) - (b._distance ?? 9999));
    } else {
      filtered.sort((a, b) => {
        const aProf = a.handymanProfile!;
        const bProf = b.handymanProfile!;
        if (sortBy === "reviews") {
          return bProf.reviewCount - aProf.reviewCount;
        }
        return bProf.ratingAvg - aProf.ratingAvg;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);

    const mapItem = (u: (typeof items)[0]) => ({
      id: u.id,
      name: u.name,
      city: u.city,
      categories: u.handymanProfile?.categories ?? [],
      ratingAvg: u.handymanProfile?.ratingAvg ?? 0,
      reviewCount: u.handymanProfile?.reviewCount ?? 0,
      avatarUrl: (u.handymanProfile as { avatarUrl?: string } | null)?.avatarUrl ?? null,
    });

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
