import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendOfferAcceptedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    const { id: offerId } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { request: true },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, error: "Ponuda nije pronađena" },
        { status: 404 }
      );
    }

    const req = offer.request;
    let isOwner = false;
    if (req.userId && session?.user?.id === req.userId) {
      isOwner = true;
    } else if (!req.userId && req.requesterToken) {
      const body = await request.json().catch(() => ({}));
      const token = (body as { token?: string }).token;
      isOwner = token === req.requesterToken;
    }

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Samo vlasnik zahtjeva može prihvatiti ponudu" },
        { status: 403 }
      );
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "Ponuda nije dostupna za prihvatanje" },
        { status: 400 }
      );
    }

    if (offer.request.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Zahtjev više ne prihvata ponude" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.offer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      }),
      prisma.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offerId },
        },
        data: { status: "REJECTED" },
      }),
      prisma.request.update({
        where: { id: offer.requestId },
        data: { status: "IN_PROGRESS" },
      }),
    ]);

    const requesterName = req.userId
      ? (await prisma.user.findUnique({
          where: { id: req.userId },
          select: { name: true },
        }))?.name
      : req.requesterName;
    sendOfferAcceptedEmail(
      offer.handymanId,
      offer.request.category,
      requesterName ?? "Korisnik"
    );
    createNotification(offer.handymanId, "OFFER_ACCEPTED", "Ponuda prihvaćena", {
      body: `${requesterName ?? "Korisnik"} je prihvatio vašu ponudu za ${offer.request.category}`,
      link: `/request/${offer.requestId}`,
    });

    const updated = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { request: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logError("Accept offer error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri prihvatanju ponude" },
      { status: 500 }
    );
  }
}
