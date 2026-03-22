import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi("requests");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (!["PENDING_REVIEW", null].includes(request.adminStatus)) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije u stanju za ovu akciju" },
        { status: 400 }
      );
    }

    await prisma.request.update({
      where: { id },
      data: { adminStatus: "SUSPICIOUS" },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "MARK_REQUEST_SUSPICIOUS",
      entityType: "request",
      entityId: id,
      oldValue: { adminStatus: request.adminStatus },
      newValue: { adminStatus: "SUSPICIOUS" },
    });

    return NextResponse.json({ success: true, data: { adminStatus: "SUSPICIOUS" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
