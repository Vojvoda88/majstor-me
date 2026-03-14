import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/db");
    const searchParams = req.nextUrl?.searchParams ?? new URLSearchParams();
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sortBy") || "rating";

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

    if (city) {
      filtered = filtered.filter(
        (u) =>
          u.city === city ||
          (u.handymanProfile?.cities ?? []).includes(city)
      );
    }

    filtered.sort((a, b) => {
      const aProf = a.handymanProfile!;
      const bProf = b.handymanProfile!;
      if (sortBy === "reviews") {
        return bProf.reviewCount - aProf.reviewCount;
      }
      return bProf.ratingAvg - aProf.ratingAvg;
    });

    return NextResponse.json({
      handymen: filtered.map((u) => ({
        id: u.id,
        name: u.name,
        city: u.city,
        categories: u.handymanProfile?.categories ?? [],
        ratingAvg: u.handymanProfile?.ratingAvg ?? 0,
        reviewCount: u.handymanProfile?.reviewCount ?? 0,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch handymen" },
      { status: 500 }
    );
  }
}
