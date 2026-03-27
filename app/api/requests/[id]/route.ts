import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { sendJobCompletedEmail } from "@/lib/email";
import { logError } from "@/lib/logger";
import { zodErrorToString } from "@/lib/api-response";

const PRIVATE_REQUEST_DETAIL_SELECT = {
  id: true,
  category: true,
  subcategory: true,
  title: true,
  description: true,
  city: true,
  urgency: true,
  status: true,
  adminStatus: true,
  deletedAt: true,
  createdAt: true,
  user: { select: { id: true, name: true, city: true } },
  offers: {
    select: {
      id: true,
      status: true,
      createdAt: true,
      handyman: {
        select: {
          id: true,
          name: true,
          city: true,
          handymanProfile: {
            select: {
              ratingAvg: true,
              reviewCount: true,
              verifiedStatus: true,
            },
          },
        },
      },
    },
  },
  review: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: { select: { id: true, name: true } },
    },
  },
  requesterName: true,
  requesterPhone: true,
  requesterEmail: true,
  address: true,
  photos: true,
} as const;

const patchRequestSchema = z.object({
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const { id } = await params;
    const session = await auth();
    const req = await prisma.request.findUnique({
      where: { id },
      select: PRIVATE_REQUEST_DETAIL_SELECT,
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = !!(session?.user?.id && req.user?.id && session.user.id === req.user.id);
    const isPubliclyVisible =
      req.deletedAt == null &&
      req.adminStatus !== "SPAM" &&
      req.adminStatus !== "DELETED" &&
      req.status === "OPEN";

    if (!isAdmin && !isOwner && !isPubliclyVisible) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    if (isAdmin || isOwner) {
      return NextResponse.json({ success: true, data: req });
    }

    const safeData = {
      id: req.id,
      category: req.category,
      subcategory: req.subcategory,
      title: req.title,
      description: req.description,
      city: req.city,
      urgency: req.urgency,
      status: req.status,
      adminStatus: req.adminStatus,
      createdAt: req.createdAt,
      user: req.user ? { id: req.user.id, name: req.user.name, city: req.user.city } : null,
      offers: req.offers,
      review: req.review,
    };

    return NextResponse.json({ success: true, data: safeData });
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
    const { prisma } = await import("@/lib/db");
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
        await prisma.handymanProfile.updateMany({
          where: { userId: acceptedOffer.handymanId },
          data: { completedJobsCount: { increment: 1 } },
        });
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
