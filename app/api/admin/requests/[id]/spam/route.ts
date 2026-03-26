import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { refundCreditsForSpamRequest } from "@/lib/credits";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("requests");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const request = await prisma.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    const refundResult = await refundCreditsForSpamRequest(
      prisma,
      id,
      auth.session.user.id
    );

    await prisma.request.update({
      where: { id },
      data: { adminStatus: "SPAM" },
      select: { id: true },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "MARK_SPAM",
      entityType: "request",
      entityId: id,
      newValue: {
        adminStatus: "SPAM",
        refundCount: refundResult.refundCount,
        totalCreditsRefunded: refundResult.totalCreditsRefunded,
        alreadyRefunded: refundResult.alreadyRefunded,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        adminStatus: "SPAM",
        refundCount: refundResult.refundCount,
        totalCreditsRefunded: refundResult.totalCreditsRefunded,
        alreadyRefunded: refundResult.alreadyRefunded,
      },
    });
  } catch (error) {
    console.error("Mark spam error:", error);
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
