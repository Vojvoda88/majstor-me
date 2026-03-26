import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

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
      select: { id: true, adminStatus: true },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (request.adminStatus !== "DELETED") {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije odbijen" },
        { status: 400 }
      );
    }

    await prisma.request.update({
      where: { id },
      data: { adminStatus: "PENDING_REVIEW", deletedAt: null },
      select: { id: true },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "RESTORE",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "PENDING_REVIEW" },
    });

    return NextResponse.json({ success: true, data: { adminStatus: "PENDING_REVIEW" } });
  } catch (error) {
    console.error("Restore request error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri vraćanju" },
      { status: 500 }
    );
  }
}
