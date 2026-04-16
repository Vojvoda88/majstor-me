import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { CITIES, REQUEST_CATEGORIES, MAX_REQUESTS_PER_DAY } from "@/lib/constants";
import { getInternalCategory } from "@/lib/categories";
import { validateRequestTextFields } from "@/lib/contact-sanitization";
import { zodErrorToString } from "@/lib/api-response";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { generateGuestAccessSecret } from "@/lib/guest-request-token";

/** Jedan red u Vercel logu — tačan uzrok bez nagađanja. */
export function logRequestCreateSubmitFatal(step: string, err: unknown): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[RequestCreateSubmit] fatal", {
      step,
      prismaCode: err.code,
      meta: err.meta,
      message: err.message.slice(0, 800),
    });
    return;
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error("[RequestCreateSubmit] fatal", {
      step,
      kind: "PrismaClientValidationError",
      message: err.message.slice(0, 800),
    });
    return;
  }
  const e = err instanceof Error ? err : new Error(String(err));
  console.error("[RequestCreateSubmit] fatal", {
    step,
    name: e.name,
    message: e.message.slice(0, 800),
    stack: process.env.NODE_ENV === "development" ? e.stack?.slice(0, 1200) : undefined,
  });
}

export const createRequestSchema = z.object({
  requesterName: z.string().min(2, "Unesite ime"),
  title: z.string().min(3, "Naslov mora imati najmanje 3 karaktera"),
  category: z.enum(REQUEST_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional(),
  description: z.string().min(10, "Opis mora imati najmanje 10 karaktera").max(2000, "Opis predug"),
  city: z.string().min(1, "Unesite grad"),
  requesterPhone: z.string().min(6, "Unesite broj telefona"),
  requesterViberPhone: z.string().optional(),
  requesterWhatsappPhone: z.string().optional(),
  requesterEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  urgency: z.enum(["HITNO_DANAS", "U_NAREDNA_2_DANA", "NIJE_HITNO"]),
  photos: z.array(z.string().url()).max(5, "Maksimalno 5 slika").optional().default([]),
});

export type CreateRequestSharedResult =
  | {
      ok: true;
      data: {
        id: string;
        handymenNotified: number;
        /** Samo guest: tajni link za praćenje (ne čuva se u bazi). */
        guestAccessToken?: string;
      };
    }
  | { ok: false; error: string; status: number };

/** NFC + mapiranje slug/label → internal prije Zod enum validacije. */
function normalizeCategoryInRaw(raw: Record<string, unknown>): void {
  if (typeof raw.category !== "string") return;
  const t = raw.category.trim().normalize("NFC");
  const mapped = getInternalCategory(t);
  raw.category = mapped ?? t;
}

function normalizeCityInRaw(raw: Record<string, unknown>): void {
  if (typeof raw.city !== "string") return;
  const t = raw.city.trim();
  const match = CITIES.find((c) => c.toLowerCase() === t.toLowerCase());
  if (match) raw.city = match;
}

/**
 * INSERT zahtjeva — retry za gosta ako hash koliduje (P2002) ili kolona/hash ne prolazi (P2022).
 */
async function prismaRequestCreateSafe(
  prisma: PrismaClient,
  data: Prisma.RequestUncheckedCreateInput,
  guestPlain: string | null
): Promise<{ id: string; guestPlainOut: string | null }> {
  const isGuest = data.userId === null || data.userId === undefined;
  try {
    const row = await prisma.request.create({ data, select: { id: true } });
    return { id: row.id, guestPlainOut: guestPlain };
  } catch (e) {
    if (!isGuest || !data.guestAccessTokenHash) throw e;
    if (!(e instanceof Prisma.PrismaClientKnownRequestError)) throw e;

    if (e.code === "P2002") {
      console.warn("[RequestCreateSubmit] db_guest_hash_unique_retry");
      const newSecret = generateGuestAccessSecret();
      try {
        const row = await prisma.request.create({
          data: { ...data, guestAccessTokenHash: newSecret.hash },
          select: { id: true },
        });
        return { id: row.id, guestPlainOut: newSecret.plain };
      } catch (e2) {
        logRequestCreateSubmitFatal("step_db_prisma_create_after_p2002_retry", e2);
        throw e2;
      }
    }

    if (e.code === "P2022") {
      console.warn("[RequestCreateSubmit] db_guest_hash_column_retry_without_hash", { meta: e.meta });
      const { guestAccessTokenHash: _h, ...rest } = data;
      try {
        const row = await prisma.request.create({
          data: { ...rest, guestAccessTokenHash: null },
          select: { id: true },
        });
        return { id: row.id, guestPlainOut: null };
      } catch (e2) {
        logRequestCreateSubmitFatal("step_db_prisma_create_after_p2022_retry", e2);
        throw e2;
      }
    }

    logRequestCreateSubmitFatal("step_db_prisma_create_guest_unhandled_code", e);
    throw e;
  }
}

/**
 * Zajednička logika za POST /api/requests i server action.
 * `session` iz auth() (server action / RSC) ili authFromNextRequest (API).
 */
export async function createRequestShared(
  session: Session | null,
  body: unknown
): Promise<CreateRequestSharedResult> {
  try {
    console.info("[RequestCreateSubmit] step_enter", { step: "step_db_import" });
    const { prisma } = await import("@/lib/db");
    const isGuest = !session?.user?.id;

    if (!isGuest && session!.user!.role !== "USER") {
      return { ok: false, error: "Samo korisnici mogu kreirati zahtjeve", status: 403 };
    }

    if (!isGuest) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      console.info("[RequestCreateSubmit] step_enter", { step: "step_db_rate_limit_count" });
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
    normalizeCategoryInRaw(raw);
    normalizeCityInRaw(raw);

    console.info("[RequestCreateSubmit] parse_start");
    const parsed = createRequestSchema.safeParse({
      ...raw,
      requesterEmail: typeof raw.requesterEmail === "string" ? raw.requesterEmail.trim() || undefined : undefined,
    });
    if (!parsed.success) {
      console.info("[RequestCreateSubmit] validation_fail", { detail: zodErrorToString(parsed.error) });
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
    console.info("[RequestCreateSubmit] step_enter", { step: "step_db_duplicate_check" });
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

    const { requesterName, title, requesterPhone, requesterViberPhone, requesterWhatsappPhone, requesterEmail, ...rest } = parsed.data;
    const emailTrimmed = requesterEmail?.trim() || undefined;
    const viberTrimmed = requesterViberPhone?.trim() || undefined;
    const whatsappTrimmed = requesterWhatsappPhone?.trim() || undefined;
    const phoneNorm = parsed.data.requesterPhone.replace(/\D/g, "");
    const emailNorm = (emailTrimmed ?? session?.user?.email ?? "").trim().toLowerCase();
    const blacklistedPhones = await prisma.blacklistedPhone.findMany({
      select: { phone: true },
    });
    const blacklistedEmails = await prisma.blacklistedEmail.findMany({
      select: { email: true },
    });
    const isBlacklisted = blacklistedPhones.some((b) => b.phone.replace(/\D/g, "") === phoneNorm);
    const isEmailBlacklisted =
      emailNorm.length > 0 &&
      blacklistedEmails.some((b) => b.email.trim().toLowerCase() === emailNorm);

    let guestSecret = isGuest ? generateGuestAccessSecret() : null;

    if (isBlacklisted || isEmailBlacklisted) {
      console.info("[RequestCreateSubmit] step_enter", { step: "step_db_request_create_spam" });
      const spamData: Prisma.RequestUncheckedCreateInput = {
        userId: isGuest ? null : session!.user!.id,
        requesterName: isGuest ? parsed.data.requesterName : undefined,
        requesterPhone: parsed.data.requesterPhone,
        requesterViberPhone: viberTrimmed,
        requesterWhatsappPhone: whatsappTrimmed,
        requesterEmail: isGuest ? emailTrimmed : undefined,
        title: parsed.data.title ?? undefined,
        category: parsed.data.category,
        subcategory: parsed.data.subcategory,
        description: descTrimmed,
        city: parsed.data.city,
        address: parsed.data.address,
        urgency: parsed.data.urgency,
        photos: parsed.data.photos ?? [],
        adminStatus: "SPAM",
        guestAccessTokenHash: guestSecret?.hash,
      };
      const created = await prismaRequestCreateSafe(prisma, spamData, guestSecret?.plain ?? null);
      console.info("[RequestCreateSubmit] db_create_spam_ok", { id: created.id });
      return {
        ok: true,
        data: {
          id: created.id,
          handymenNotified: 0,
          ...(isGuest && created.guestPlainOut ? { guestAccessToken: created.guestPlainOut } : {}),
        },
      };
    }

    const createData: Prisma.RequestUncheckedCreateInput = {
      userId: isGuest ? null : session!.user!.id,
      requesterName: isGuest ? requesterName : undefined,
      requesterPhone: requesterPhone,
      requesterViberPhone: viberTrimmed,
      requesterWhatsappPhone: whatsappTrimmed,
      requesterEmail: isGuest ? emailTrimmed : undefined,
      guestAccessTokenHash: guestSecret?.hash,
      title: title ?? undefined,
      ...rest,
      description: descTrimmed,
      adminStatus: "PENDING_REVIEW",
    };

    console.info("[RequestCreateSubmit] step_enter", { step: "step_db_request_create_pending" });
    const created = await prismaRequestCreateSafe(prisma, createData, guestSecret?.plain ?? null);
    console.info("[RequestCreateSubmit] db_create_ok", { id: created.id });

    const reqId = created.id;
    const guestTokenOut = created.guestPlainOut;

    try {
      await trackFunnelEvent(prisma, "request_created", { requestId: reqId }, session?.user?.id ?? null);
    } catch (fe) {
      console.error("[RequestCreateSubmit] funnel_track_failed", fe);
    }

    try {
      const { notifyAdminsNewPendingRequest } = await import("@/lib/admin-signals");
      await notifyAdminsNewPendingRequest({
        requestId: reqId,
        category: parsed.data.category,
        city: parsed.data.city,
        title: title ?? undefined,
        urgency: parsed.data.urgency,
      });
    } catch (ne) {
      console.error("[RequestCreateSubmit] notify_admins_failed", ne);
    }

    if (isGuest && guestTokenOut) {
      try {
        const { sendGuestRequestTrackingEmail } = await import("@/lib/email");
        await sendGuestRequestTrackingEmail({
          toEmail: emailTrimmed,
          category: parsed.data.category,
          city: parsed.data.city,
          title: title ?? parsed.data.category,
          guestPlainToken: guestTokenOut,
        });
      } catch (mailErr) {
        console.error("[RequestCreateSubmit] guest_email_failed", mailErr);
      }
    }

    return {
      ok: true,
      data: {
        id: reqId,
        handymenNotified: 0,
        ...(isGuest && guestTokenOut ? { guestAccessToken: guestTokenOut } : {}),
      },
    };
  } catch (e) {
    logRequestCreateSubmitFatal("step_outer_catch", e);
    return {
      ok: false,
      error: "Greška pri snimanju zahtjeva. Pokušajte ponovo za nekoliko trenutaka.",
      status: 500,
    };
  }
}
