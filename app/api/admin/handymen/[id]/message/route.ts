import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { createNotification } from "@/lib/notifications";
import { sendAdminDirectMessageEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const messageSchema = z.object({
  title: z.string().trim().min(3, "Naslov je prekratak").max(120, "Naslov je predugačak"),
  body: z.string().trim().min(5, "Poruka je prekratka").max(1200, "Poruka je predugačka"),
  sendEmail: z.boolean().optional().default(true),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi("workers_write", request);
    if (!authResult.ok) return authResult.response;

    const parsed = messageSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos" },
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
      return NextResponse.json({ success: false, error: "Majstor nije pronađen" }, { status: 404 });
    }

    await createNotification(handyman.id, "NEW_MESSAGE", parsed.data.title, {
      body: parsed.data.body,
      link: "/dashboard/handyman",
      idempotencyKey: `admin_msg:${authResult.session.user.id}:${handyman.id}:${Date.now()}`,
    });

    if (parsed.data.sendEmail) {
      void sendAdminDirectMessageEmail({
        to: handyman.email,
        handymanName: handyman.name,
        title: parsed.data.title,
        body: parsed.data.body,
      });
    }

    await createAuditLog(prisma, {
      adminId: authResult.session.user.id,
      adminRole: authResult.adminRole,
      actionType: "SEND_HANDYMAN_MESSAGE",
      entityType: "handyman",
      entityId: handyman.id,
      newValue: { title: parsed.data.title, sendEmail: parsed.data.sendEmail },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Greška pri slanju poruke majstoru." },
      { status: 500 }
    );
  }
}
