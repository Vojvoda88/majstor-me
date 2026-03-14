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

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: id },
      include: { user: true },
    });

    if (!profile || profile.user.role !== "HANDYMAN") {
      return NextResponse.json({ success: false, error: "Majstor nije pronađen" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.handymanProfile.update({
        where: { userId: id },
        data: { workerStatus: "BANNED" },
      }),
      prisma.user.update({
        where: { id },
        data: { bannedAt: new Date(), suspendedAt: null },
      }),
    ]);

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "REJECT_WORKER",
      entityType: "handyman",
      entityId: id,
      newValue: { workerStatus: "BANNED" },
    });

    return NextResponse.json({ success: true, data: { workerStatus: "BANNED" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
