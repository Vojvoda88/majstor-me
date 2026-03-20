import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendNewOfferEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { logError } from "@/lib/logger";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { zodErrorToString } from "@/lib/api-response";

const createOfferSchema = z
  .object({
    requestId: z.string().cuid(),
    priceType: z.enum(["PO_DOGOVORU", "OKVIRNA", "IZLAZAK_NA_TEREN", "FIKSNA"]),
    priceValue: z.number().optional().nullable(),
    message: z.string().max(1000).optional(),
    proposedDate: z.union([z.string().datetime(), z.string()]).optional().nullable(),
    proposedArrival: z.string().max(200).optional(), // procijenjeni dolazak (npr. "Sutra ujutro")
  })
  .refine(
    (data) => data.priceType !== "FIKSNA" || (data.priceValue != null && data.priceValue >= 0),
    { message: "Fiksna cijena zahtijeva pozitivan iznos", path: ["priceValue"] }
  );

export async function POST(request: Request) {
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
        { success: false, error: "Samo majstori mogu slati ponude" },
        { status: 403 }
      );
    }

    if (isRateLimited(`offer:${session.user.id}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše ponuda. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(`offer:${session.user.id}`)) } }
      );
    }

    const body = await request.json();
    const parsed = createOfferSchema.safeParse({
      ...body,
      proposedDate: body.proposedDate || null,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: zodErrorToString(parsed.error) },
        { status: 400 }
      );
    }

    const { requestId, priceType, priceValue, message, proposedDate } = parsed.data;

    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: { offers: true, contactUnlocks: { where: { handymanId: session.user.id } } },
    });

    if (!req) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije pronađen" },
        { status: 404 }
      );
    }

    const { isCreditsRequired } = await import("@/lib/credits");
    const hasUnlocked = req.contactUnlocks.length > 0;
    if (isCreditsRequired() && !hasUnlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "Morate otključati lead prije slanja ponude. Otključajte lead da biste vidjeli kontakt i poslali ponudu.",
          needsUnlock: true,
        },
        { status: 402 }
      );
    }

    if (req.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Ovaj zahtjev više ne prihvata ponude" },
        { status: 400 }
      );
    }

    if (req.adminStatus && req.adminStatus !== "DISTRIBUTED") {
      return NextResponse.json(
        { success: false, error: "Ovaj zahtjev još nije odobren za ponude" },
        { status: 400 }
      );
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: session.user.id },
      include: { workerCategories: { include: { category: true } } },
    });

    if (profile?.workerStatus && profile.workerStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Vaš profil još nije odobren. Sačekajte odobrenje admina." },
        { status: 403 }
      );
    }

    const hasCategory =
      profile?.workerCategories?.some((wc) => wc.category.name === req.category) ?? false;
    if (!profile || !hasCategory) {
      return NextResponse.json(
        { success: false, error: "Niste registrovani za ovu kategoriju" },
        { status: 403 }
      );
    }

    const existingOffer = req.offers.find((o) => o.handymanId === session.user.id);
    if (existingOffer) {
      return NextResponse.json(
        { success: false, error: "Već ste poslali ponudu na ovaj zahtjev" },
        { status: 400 }
      );
    }

    if (priceType === "FIKSNA" && (priceValue == null || priceValue < 0)) {
      return NextResponse.json(
        { success: false, error: "Fiksna cijena zahtijeva iznos" },
        { status: 400 }
      );
    }

    const handyman = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    const offer = await prisma.offer.create({
      data: {
        requestId,
        handymanId: session.user.id,
        priceType,
        priceValue: priceValue ?? undefined,
        message: message ?? undefined,
        proposedDate: proposedDate ? new Date(proposedDate) : undefined,
        proposedArrival: body.proposedArrival ?? undefined,
      },
    });

    if (hasUnlocked) {
      void trackFunnelEvent(
        prisma,
        "offer_sent_after_unlock",
        { requestId, handymanId: session.user.id },
        session.user.id
      );
    }

    sendNewOfferEmail(
      req.userId ?? null,
      req.category,
      handyman?.name ?? "Majstor",
      req.requesterEmail
    );
    if (req.userId) {
      createNotification(req.userId, "NEW_OFFER", `Nova ponuda: ${req.category}`, {
        body: `${handyman?.name ?? "Majstor"} vam je poslao ponudu`,
        link: `/request/${requestId}`,
      });
    }

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    logError("POST offer error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri slanju ponude" },
      { status: 500 }
    );
  }
}
