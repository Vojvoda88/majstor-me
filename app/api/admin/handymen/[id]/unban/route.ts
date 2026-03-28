import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { replayBacklogNotificationsForActiveHandyman } from "@/lib/handyman-backlog-replay";

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

    if (profile.workerStatus !== "BANNED" && !profile.user.bannedAt) {
      return NextResponse.json(
        { success: false, error: "Majstor nije banned" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.handymanProfile.update({
        where: { userId: id },
        data: { workerStatus: "ACTIVE" },
      }),
      prisma.user.update({
        where: { id },
        data: { bannedAt: null, suspendedAt: null },
      }),
    ]);

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "UNBAN",
      entityType: "handyman",
      entityId: id,
      newValue: { workerStatus: "ACTIVE" },
    });

    try {
      const replay = await replayBacklogNotificationsForActiveHandyman(prisma, id);
      console.info("[AdminHandymanUnbanAPI] backlog replay", { handymanUserId: id, ...replay });
    } catch (replayError) {
      console.warn("[AdminHandymanUnbanAPI] backlog replay failed", {
        handymanUserId: id,
        error: replayError instanceof Error ? replayError.message : String(replayError),
      });
    }

    return NextResponse.json({ success: true, data: { workerStatus: "ACTIVE" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
