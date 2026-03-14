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

    const user = await prisma.user.findUnique({
      where: { id, role: "HANDYMAN" },
      include: { handymanProfile: true },
    });
    if (!user) return NextResponse.json({ success: false, error: "Nije pronađen" }, { status: 404 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { suspendedAt: new Date() },
      }),
      user.handymanProfile
        ? prisma.handymanProfile.update({
            where: { userId: id },
            data: { workerStatus: "SUSPENDED" },
          })
        : Promise.resolve(),
    ]);

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
