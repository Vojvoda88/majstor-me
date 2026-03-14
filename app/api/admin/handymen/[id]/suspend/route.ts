import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("workers_write");
    if (!auth.ok) return auth.response;

    const { prisma } = await import("@/lib/db");
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id, role: "HANDYMAN" } });
    if (!user) return NextResponse.json({ success: false, error: "Nije pronađen" }, { status: 404 });

    await prisma.user.update({
      where: { id },
      data: { suspendedAt: new Date() },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "SUSPEND",
      entityType: "handyman",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
