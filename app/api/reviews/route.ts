import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendNewReviewEmail } from "@/lib/email";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const createReviewSchema = z.object({
  requestId: z.string().cuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { requestId, rating, comment } = parsed.data;

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        offers: { where: { status: "ACCEPTED" } },
        review: true,
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    if (req.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Samo vlasnik zahtjeva može ostaviti recenziju" },
        { status: 403 }
      );
    }

    if (req.status !== "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Zahtjev mora biti završen da bi ostavili recenziju" },
        { status: 400 }
      );
    }

    if (req.review) {
      return NextResponse.json(
        { success: false, error: "Već ste ostavili recenziju za ovaj zahtjev" },
        { status: 400 }
      );
    }

    const acceptedOffer = req.offers[0];
    if (!acceptedOffer) {
      return NextResponse.json(
        { success: false, error: "Nema prihvaćene ponude" },
        { status: 400 }
      );
    }

    const revieweeId = acceptedOffer.handymanId;

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          requestId,
          reviewerId: session.user!.id,
          revieweeId,
          rating,
          comment: comment ?? undefined,
        },
      });

      const reviews = await tx.review.findMany({
        where: { revieweeId },
      });
      const avg = reviews.reduce((s, rev) => s + rev.rating, 0) / reviews.length;

      await tx.handymanProfile.update({
        where: { userId: revieweeId },
        data: {
          ratingAvg: Math.round(avg * 10) / 10,
          reviewCount: reviews.length,
        },
      });

      return r;
    });

    sendNewReviewEmail(revieweeId, rating, req.category);

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    logError("POST review error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri ostavljanju recenzije" },
      { status: 500 }
    );
  }
}
