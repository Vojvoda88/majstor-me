import { NextResponse } from "next/server";
import { PUBLIC_CATEGORY_LISTING, workerCategoryMatchesRequest } from "@/lib/categories";
import { prismaWhereUserActiveHandymanForPublicCatalog } from "@/lib/handyman-truth";

export const revalidate = 60;

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");

    const users = await prisma.user.findMany({
      where: prismaWhereUserActiveHandymanForPublicCatalog(),
      select: {
        id: true,
        handymanProfile: {
          select: {
            workerCategories: {
              select: {
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    const counts = new Map<string, number>();
    for (const category of PUBLIC_CATEGORY_LISTING) {
      counts.set(category.slug, 0);
    }

    for (const user of users) {
      const workerCategories = user.handymanProfile?.workerCategories ?? [];
      const names = workerCategories.map((wc) => wc.category.name);
      if (names.length === 0) continue;

      for (const category of PUBLIC_CATEGORY_LISTING) {
        const hasMatch = names.some((name) =>
          workerCategoryMatchesRequest(name, category.internalCategory)
        );
        if (hasMatch) {
          counts.set(category.slug, (counts.get(category.slug) ?? 0) + 1);
        }
      }
    }

    const items = PUBLIC_CATEGORY_LISTING.map((category) => ({
      slug: category.slug,
      label: category.displayName,
      count: counts.get(category.slug) ?? 0,
    })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sr-Latn"));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

