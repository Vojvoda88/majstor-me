import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendJobCompletedEmail } from "@/lib/email";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const patchRequestSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const req = await prisma.request.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, city: true } },
        offers: {
          include: {
            handyman: {
              select: {
                id: true,
                name: true,
                city: true,
                handymanProfile: {
                  select: {
                    bio: true,
                    categories: true,
                    ratingAvg: true,
                    reviewCount: true,
                    verifiedStatus: true,
                  },
                },
              },
            },
          },
        },
        review: true,
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: req });
  } catch (error) {
    logError("GET request error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju zahtjeva" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = patchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }
    const { status } = parsed.data;

    const req = await prisma.request.findUnique({ where: { id } });
    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    if (req.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Nemate pristup ovom zahtjevu" },
        { status: 403 }
      );
    }

    if (status === "COMPLETED" && req.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { success: false, error: "Zahtjev mora biti u toku da bi se označio završenim" },
        { status: 400 }
      );
    }

    const updated = await prisma.request.update({
      where: { id },
      data: { status },
    });

    if (status === "COMPLETED") {
      const acceptedOffer = await prisma.offer.findFirst({
        where: { requestId: id, status: "ACCEPTED" },
      });
      if (acceptedOffer) {
        sendJobCompletedEmail(acceptedOffer.handymanId, updated.category);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("PATCH request error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri ažuriranju zahtjeva" },
      { status: 500 }
    );
  }
}
