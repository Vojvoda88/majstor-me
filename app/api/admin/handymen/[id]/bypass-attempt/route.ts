import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { createNotification } from "@/lib/notifications";
import { sendAdminDirectMessageEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const payloadSchema = z.object({
  reasons: z
    .array(z.enum(["PHONE_NUMBER", "INAPPROPRIATE_CONTENT"]))
    .min(1, "Izaberite bar jedan razlog."),
  locations: z
    .array(z.enum(["AVATAR", "BIO", "GALLERY"]))
    .min(1, "Izaberite gdje je pronađen sadržaj."),
  sendEmail: z.boolean().optional().default(true),
});

const locationLabel: Record<"AVATAR" | "BIO" | "GALLERY", string> = {
  AVATAR: "profilna fotografija",
  BIO: "opis profila",
  GALLERY: "fotografije radova",
};

const reasonLabel: Record<"PHONE_NUMBER" | "INAPPROPRIATE_CONTENT", string> = {
  PHONE_NUMBER: "pronađen broj telefona / kontakt podaci",
  INAPPROPRIATE_CONTENT: "neprimjeren sadržaj",
};

function buildBypassWarningMessage(
  locations: ("AVATAR" | "BIO" | "GALLERY")[],
  reasons: ("PHONE_NUMBER" | "INAPPROPRIATE_CONTENT")[]
) {
  const whereList = locations.map((l) => `- ${locationLabel[l]}`).join("\n");
  const reasonList = reasons.map((r) => `- ${reasonLabel[r]}`).join("\n");

  return [
    "Evidentiran je pokušaj zaobilaženja pravila platforme na vašem profilu.",
    "",
    "Pronađeno u:",
    whereList,
    "",
    "Razlog:",
    reasonList,
    "",
    "Molimo uklonite navedeni sadržaj sa profila kako bi nalog ostao aktivan.",
    "U slučaju ponavljanja, profil može biti suspendovan ili banovan.",
  ].join("\n");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi("workers_write", request);
    if (!authResult.ok) return authResult.response;

    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos." },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const { id: handymanId } = await params;
    const handyman = await prisma.user.findUnique({
      where: { id: handymanId, role: "HANDYMAN" },
      select: { id: true, name: true, email: true },
    });

    if (!handyman) {
      return NextResponse.json({ success: false, error: "Majstor nije pronađen." }, { status: 404 });
    }

    const title = "Upozorenje: pokušaj zaobilaženja pravila";
    const body = buildBypassWarningMessage(parsed.data.locations, parsed.data.reasons);

    await createNotification(handyman.id, "NEW_MESSAGE", title, {
      body,
      link: "/dashboard/handyman/profile",
      idempotencyKey: `bypass_attempt:${authResult.session.user.id}:${handyman.id}:${Date.now()}`,
    });

    if (parsed.data.sendEmail) {
      void sendAdminDirectMessageEmail({
        to: handyman.email,
        handymanName: handyman.name,
        title,
        body,
      });
    }

    await createAuditLog(prisma, {
      adminId: authResult.session.user.id,
      adminRole: authResult.adminRole,
      actionType: "BYPASS_ATTEMPT_NOTICE",
      entityType: "handyman",
      entityId: handyman.id,
      newValue: {
        reasons: parsed.data.reasons,
        locations: parsed.data.locations,
        sendEmail: parsed.data.sendEmail,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Greška pri slanju upozorenja." },
      { status: 500 }
    );
  }
}
