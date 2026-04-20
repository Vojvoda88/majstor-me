import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/saved-handymen — lista sačuvanih majstora za prijavljenog korisnika */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const saved = await prisma.savedHandyman.findMany({
      where: { userId: session.user.id },
      include: {
        handyman: {
          select: {
            id: true,
            name: true,
            city: true,
            handymanProfile: {
              select: {
                avatarUrl: true,
                verifiedStatus: true,
                ratingAvg: true,
                reviewCount: true,
                workerStatus: true,
                workerCategories: {
                  include: { category: { select: { name: true } } },
                  take: 3,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    logError("GET saved-handymen error", error);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}

const toggleSchema = z.object({
  handymanId: z.string().cuid(),
});

/** POST /api/saved-handymen — toggle (sačuvaj ili ukloni) */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni" }, { status: 401 });
    }

    if (session.user.role !== "USER") {
      return NextResponse.json(
        { success: false, error: "Samo korisnici mogu čuvati majstore" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = toggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
    }

    const { handymanId } = parsed.data;
    const { prisma } = await import("@/lib/db");

    const existing = await prisma.savedHandyman.findUnique({
      where: { userId_handymanId: { userId: session.user.id, handymanId } },
    });

    if (existing) {
      await prisma.savedHandyman.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { saved: false } });
    }

    await prisma.savedHandyman.create({
      data: { userId: session.user.id, handymanId },
    });
    return NextResponse.json({ success: true, data: { saved: true } });
  } catch (error) {
    logError("POST saved-handymen error", error);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
