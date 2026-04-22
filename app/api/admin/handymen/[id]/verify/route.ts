import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { sendVerificationStatusEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdminApi("workers_write", _request);
    if (!authResult.ok) return authResult.response;

    const { prisma } = await import("@/lib/db");
    const { id: handymanUserId } = await params;

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: handymanUserId },
    });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Majstor nije pronađen" }, { status: 404 });
    }

    const body = _request.headers.get("content-type")?.includes("application/json")
      ? await _request.json()
      : {};
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Neispravan status" },
        { status: 400 }
      );
    }

    const oldStatus = profile.verifiedStatus;
    const updated = await prisma.handymanProfile.update({
      where: { userId: handymanUserId },
      data: { verifiedStatus: parsed.data.status },
    });

    if (parsed.data.status === "VERIFIED") {
      await prisma.user.update({
        where: { id: handymanUserId },
        data: { emailVerified: new Date() },
      });
    }

    await createAuditLog(prisma, {
      adminId: authResult.session.user.id,
      adminRole: authResult.adminRole,
      actionType: "VERIFY_HANDYMAN",
      entityType: "handyman",
      entityId: handymanUserId,
      oldValue: { verifiedStatus: oldStatus },
      newValue: { verifiedStatus: parsed.data.status, emailVerified: parsed.data.status === "VERIFIED" },
    });

    const isVerified = parsed.data.status === "VERIFIED";
    await createNotification(
      handymanUserId,
      "VERIFIED",
      isVerified ? "Profil verifikovan" : "Verifikacija nije odobrena",
      {
        body: isVerified
          ? "Va\u0161 profil je verifikovan. Na profilu se sada prikazuje bed\u017e Verifikovan."
          : "Verifikacija profila nije odobrena. Kontaktirajte podr\u0161ku za vi\u0161e informacija.",
        link: "/dashboard/handyman",
      }
    );
    void sendVerificationStatusEmail(handymanUserId, parsed.data.status);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Verify handyman error", error);
    }
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
