import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";
import {
  isCreditsRequired,
  hasEnoughCreditsForUnlock,
  spendCreditsForContactUnlock,
  getCreditsRequiredForLead,
} from "@/lib/credits";

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

    if (session.user.role !== "HANDYMAN") {
      return NextResponse.json(
        { success: false, error: "Samo majstori mogu otključati lead" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { phone: true, emailVerified: true } },
        contactUnlocks: { where: { handymanId: session.user.id } },
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    const alreadyUnlocked = req.contactUnlocks.length > 0;
    if (alreadyUnlocked) {
      const phone = req.requesterPhone ?? req.user?.phone ?? null;
      return NextResponse.json({
        success: true,
        data: { phone, address: req.address, alreadyUnlocked: true },
      });
    }

    const creditsRequired = getCreditsRequiredForLead({
      urgency: req.urgency,
      photos: req.photos,
      description: req.description,
      emailVerified: req.user?.emailVerified != null,
      phoneVerified: req.user?.phoneVerified != null,
    });

    if (isCreditsRequired()) {
      const { ok, balance } = await hasEnoughCreditsForUnlock(
        prisma,
        session.user.id,
        creditsRequired
      );
      if (!ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Nemate dovoljno kredita. Ovaj lead košta ${creditsRequired} kredita. Imate: ${balance}.`,
            needsCredits: true,
            creditsRequired,
          },
          { status: 402 }
        );
      }
    }

    const phone = req.requesterPhone ?? req.user?.phone ?? null;
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Korisnik nije unio broj telefona" },
        { status: 400 }
      );
    }

    if (isCreditsRequired()) {
      const spent = await spendCreditsForContactUnlock(
        prisma,
        session.user.id,
        requestId,
        creditsRequired
      );
      if (!spent.ok) {
        return NextResponse.json(
          { success: false, error: spent.error, needsCredits: true },
          { status: 402 }
        );
      }
    }

    await prisma.requestContactUnlock.create({
      data: {
        requestId,
        handymanId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { phone, address: req.address },
    });
  } catch (error) {
    logError("Unlock contact error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri otključavanju leada" },
      { status: 500 }
    );
  }
}
