import { NextResponse, type NextRequest } from "next/server";
import { authFromNextRequest } from "@/lib/auth";
import { logError } from "@/lib/logger";
import {
  isCreditsRequired,
  getCreditsRequiredForLead,
  createUnlockAndSpendCreditsAtomic,
} from "@/lib/credits";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { isApprovedForHandymen } from "@/lib/request-approval-gates";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await authFromNextRequest(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    if (session.user.role !== "HANDYMAN") {
      return NextResponse.json(
        { success: false, error: "Samo majstori mogu uzeti kontakt" },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { name: true, phone: true, email: true, emailVerified: true, phoneVerified: true } },
        contactUnlocks: { where: { handymanId: session.user.id } },
      },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    if (!isApprovedForHandymen({
      status: req.status,
      adminStatus: req.adminStatus,
      deletedAt: req.deletedAt,
    })) {
      return NextResponse.json(
        { success: false, error: "Zahtjev još nije odobren za distribuciju majstorima." },
        { status: 400 }
      );
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      select: { workerStatus: true },
    });
    if (profile?.workerStatus && profile.workerStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Vaš profil još nije odobren. Sačekajte odobrenje admina." },
        { status: 403 }
      );
    }

    const alreadyUnlocked = req.contactUnlocks.length > 0;
    const requesterName = req.requesterName ?? req.user?.name ?? null;
    const phone = req.requesterPhone ?? req.user?.phone ?? null;
    const email = req.requesterEmail ?? req.user?.email ?? null;
    const isVerified = !!(req.user?.emailVerified != null || req.user?.phoneVerified != null);

    if (alreadyUnlocked) {
      const creditsRequired = getCreditsRequiredForLead({
        urgency: req.urgency,
        photos: req.photos,
        description: req.description,
        emailVerified: req.user?.emailVerified != null,
        phoneVerified: req.user?.phoneVerified != null,
      });
      return NextResponse.json({
        success: true,
        data: {
          phone,
          address: req.address,
          requesterName,
          email,
          isVerified,
          creditsSpent: isCreditsRequired() ? creditsRequired : 0,
          alreadyUnlocked: true,
        },
      });
    }

    const creditsRequired = getCreditsRequiredForLead({
      urgency: req.urgency,
      photos: req.photos,
      description: req.description,
      emailVerified: req.user?.emailVerified != null,
      phoneVerified: req.user?.phoneVerified != null,
    });

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Korisnik nije unio broj telefona" },
        { status: 400 }
      );
    }

    const unlockResult = await createUnlockAndSpendCreditsAtomic(prisma, {
      handymanId: session.user.id,
      requestId,
      creditsRequired,
      chargeCredits: isCreditsRequired(),
    });
    if (!unlockResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error: unlockResult.error,
          needsCredits: true,
          creditsRequired,
        },
        { status: 402 }
      );
    }

    void trackFunnelEvent(
      prisma,
      "unlock_success",
      { requestId, creditsSpent: creditsRequired },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: {
        phone,
        address: req.address,
        requesterName,
        email,
        isVerified,
        creditsSpent: isCreditsRequired() && !unlockResult.alreadyUnlocked ? creditsRequired : 0,
        alreadyUnlocked: unlockResult.alreadyUnlocked,
      },
    });
  } catch (error) {
    logError("Unlock contact error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri uzimanju kontakta" },
      { status: 500 }
    );
  }
}
