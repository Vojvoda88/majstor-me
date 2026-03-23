import type { Session } from "next-auth";
import { z } from "zod";
import { REQUEST_CATEGORIES, MAX_REQUESTS_PER_DAY } from "@/lib/constants";
import { validateRequestTextFields } from "@/lib/contact-sanitization";
import { zodErrorToString } from "@/lib/api-response";
import { trackFunnelEvent } from "@/lib/funnel-events";

export const createRequestSchema = z.object({
  requesterName: z.string().min(2, "Unesite ime"),
  title: z.string().min(3, "Naslov mora imati najmanje 3 karaktera"),
  category: z.enum(REQUEST_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000, "Opis predug"),
  city: z.string().min(1, "Unesite grad"),
  requesterPhone: z.string().min(6, "Unesite broj telefona"),
  requesterEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
  photos: z.array(z.string().url()).max(5, "Maksimalno 5 slika").optional().default([]),
});

export type CreateRequestSharedResult =
  | { ok: true; data: Record<string, unknown> & { id: string; handymenNotified: number } }
  | { ok: false; error: string; status: number };

/**
 * Zajednička logika za POST /api/requests i server action.
 * `session` iz auth() (server action / RSC) ili authFromNextRequest (API).
 */
export async function createRequestShared(
  session: Session | null,
  body: unknown
): Promise<CreateRequestSharedResult> {
  const { prisma } = await import("@/lib/db");
  const isGuest = !session?.user?.id;

  if (!isGuest && session!.user!.role !== "USER") {
    return { ok: false, error: "Samo korisnici mogu kreirati zahtjeve", status: 403 };
  }

  if (!isGuest) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const requestCount = await prisma.request.count({
      where: {
        userId: session!.user!.id,
        createdAt: { gte: yesterday },
      },
    });
    if (requestCount >= MAX_REQUESTS_PER_DAY) {
      return { ok: false, error: "Dostigli ste dnevni limit zahtjeva (5)", status: 429 };
    }
  }

  const raw = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const parsed = createRequestSchema.safeParse({
    ...raw,
    requesterEmail: typeof raw.requesterEmail === "string" ? raw.requesterEmail.trim() || undefined : undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: zodErrorToString(parsed.error), status: 400 };
  }

  const descTrimmed = parsed.data.description.trim();
  const titleTrimmed = (parsed.data.title ?? "").trim();

  const textValidation = validateRequestTextFields(titleTrimmed, descTrimmed);
  if (!textValidation.ok) {
    return { ok: false, error: textValidation.reason, status: 400 };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const duplicate = isGuest
    ? null
    : await prisma.request.findFirst({
        where: {
          userId: session!.user!.id,
          description: descTrimmed,
          createdAt: { gte: yesterday },
        },
      });
  if (duplicate) {
    return { ok: false, error: "Već ste objavili isti zahtjev danas", status: 400 };
  }

  const phoneNorm = parsed.data.requesterPhone.replace(/\D/g, "");
  const blacklistedPhones = await prisma.blacklistedPhone.findMany({
    select: { phone: true },
  });
  const isBlacklisted = blacklistedPhones.some((b) => b.phone.replace(/\D/g, "") === phoneNorm);
  if (isBlacklisted) {
    const reqSpam = await prisma.request.create({
      data: {
        userId: isGuest ? null : session!.user!.id,
        requesterName: isGuest ? parsed.data.requesterName : undefined,
        requesterPhone: parsed.data.requesterPhone,
        requesterEmail: isGuest ? (parsed.data.requesterEmail?.trim() || undefined) : undefined,
        title: parsed.data.title ?? undefined,
        category: parsed.data.category,
        subcategory: parsed.data.subcategory,
        description: descTrimmed,
        city: parsed.data.city,
        address: parsed.data.address,
        urgency: parsed.data.urgency,
        photos: parsed.data.photos ?? [],
        adminStatus: "SPAM",
      },
    });
    return {
      ok: true,
      data: { ...reqSpam, handymenNotified: 0 },
    };
  }

  const crypto = await import("crypto");
  const requesterToken = isGuest ? crypto.randomBytes(32).toString("hex") : undefined;
  const { requesterName, title, requesterPhone, requesterEmail, ...rest } = parsed.data;
  const emailTrimmed = requesterEmail?.trim() || undefined;

  const req = await prisma.request.create({
    data: {
      userId: isGuest ? null : session!.user!.id,
      requesterName: isGuest ? requesterName : undefined,
      requesterPhone: requesterPhone,
      requesterEmail: isGuest ? emailTrimmed : undefined,
      requesterToken: requesterToken ?? undefined,
      title: title ?? undefined,
      ...rest,
      description: descTrimmed,
      adminStatus: "PENDING_REVIEW",
    },
  });

  void trackFunnelEvent(prisma, "request_created", { requestId: req.id }, session?.user?.id ?? null);

  const { notifyAdminsNewPendingRequest } = await import("@/lib/admin-signals");
  void notifyAdminsNewPendingRequest({
    requestId: req.id,
    category: req.category,
    city: req.city,
    title: req.title,
    urgency: req.urgency,
  });

  return {
    ok: true,
    data: {
      ...req,
      requesterToken: requesterToken ?? undefined,
      handymenNotified: 0,
    },
  };
}
