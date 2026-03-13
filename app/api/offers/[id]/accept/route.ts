import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendOfferAcceptedEmail } from "@/lib/email";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
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

    if (offer.request.userId !== session.user.id) {
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

    const requestOwner = await prisma.user.findUnique({
      where: { id: offer.request.userId },
      select: { name: true },
    });
    sendOfferAcceptedEmail(
      offer.handymanId,
      offer.request.category,
      requestOwner?.name ?? "Korisnik"
    );

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
