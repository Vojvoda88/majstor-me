import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      include: { reviewer: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const testimonials = reviews.map((r) => {
      const parts = r.reviewer.name?.trim().split(/\s+/) ?? [];
      const firstName = parts[0] ?? "Korisnik";
      const lastInitial = parts[1]?.charAt(0) ? `${parts[1].charAt(0)}.` : "";
      return {
        name: `${firstName} ${lastInitial}`.trim(),
        city: r.reviewer.city ?? "Crna Gora",
        text: r.comment?.trim() || "Odlična usluga!",
        rating: r.rating,
      };
    });

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ testimonials: [] });
  }
}
