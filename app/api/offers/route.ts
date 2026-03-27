import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
import { authFromNextRequest } from "@/lib/auth";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { sendNewOfferEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { logError } from "@/lib/logger";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { zodErrorToString } from "@/lib/api-response";
import { workerHasCategoryForRequest } from "@/lib/categories";
import { isApprovedForHandymen } from "@/lib/request-approval-gates";

const PRICE_TYPES_ALL = [
  "PO_DOGOVORU",
  "OKVIRNA",
  "IZLAZAK_NA_TEREN",
  "FIKSNA",
  "PREGLED_PA_KONACNA",
  "PO_SATU",
  "PO_M2",
  "PO_METRU_DUZNOM",
  "PO_TURI",
  "DRUGO",
] as const;

const createOfferSchema = z
  .object({
    requestId: z.string().cuid(),
    priceType: z.enum(PRICE_TYPES_ALL),
    priceTypeOtherLabel: z.string().max(200).optional().nullable(),
    priceValue: z.number().optional().nullable(),
    message: z.string().max(1200).optional(),
    availabilityWindow: z.string().max(80).optional().nullable(),
    includedInPrice: z.string().max(500).optional().nullable(),
    extraNote: z.string().max(2000).optional().nullable(),
    proposedDate: z.union([z.string().datetime(), z.string()]).optional().nullable(),
    proposedArrival: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.priceType === "FIKSNA") {
      if (data.priceValue == null || data.priceValue < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fiksna cijena zahtijeva iznos", path: ["priceValue"] });
      }
    }
    if (data.priceType === "DRUGO") {
      const t = (data.priceTypeOtherLabel ?? "").trim();
      if (t.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Napišite kako naplaćujete (polje „Drugo“)",
          path: ["priceTypeOtherLabel"],
        });
      }
    }
  });

export async function POST(request: NextRequest) {
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

    const {
      requestId,
      priceType,
      priceTypeOtherLabel,
      priceValue,
      message,
      availabilityWindow,
      includedInPrice,
      extraNote,
      proposedDate,
      proposedArrival,
    } = parsed.data;

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

    const hasUnlocked = req.contactUnlocks.length > 0;
    if (!hasUnlocked) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Prije slanja ponude morate otključati kontakt korisnika. Krediti se troše tek u tom koraku — zatim možete poslati ponudu ili direktno kontaktirati klijenta.",
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
      include: { workerCategories: { include: { category: true } } },
    });

    if (profile?.workerStatus && profile.workerStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "Vaš profil još nije odobren. Sačekajte odobrenje admina." },
        { status: 403 }
      );
    }

    const workerNames = profile?.workerCategories?.map((wc) => wc.category.name) ?? [];
    const hasCategory = workerHasCategoryForRequest(workerNames, req.category);
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

    let offer;
    try {
      offer = await prisma.offer.create({
        data: {
          requestId,
          handymanId: session.user.id,
          priceType,
          priceValue: priceValue ?? undefined,
          priceTypeOtherLabel: priceTypeOtherLabel?.trim() || undefined,
          availabilityWindow: availabilityWindow?.trim() || undefined,
          includedInPrice: includedInPrice?.trim() || undefined,
          extraNote: extraNote?.trim() || undefined,
          message: message ?? undefined,
          proposedDate: proposedDate ? new Date(proposedDate) : undefined,
          proposedArrival: proposedArrival?.trim() || undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json(
          { success: false, error: "Već ste poslali ponudu na ovaj zahtjev" },
          { status: 400 }
        );
      }
      throw e;
    }

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
      void sendPushToUser(prisma, req.userId, {
        title: "Stigla vam je nova ponuda",
        body: "Za posao koji ste objavili stigla je nova ponuda. Otvorite zahtjev i pogledajte detalje.",
        link: `/request/${requestId}`,
        tag: `new-offer-${offer.id}`,
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
