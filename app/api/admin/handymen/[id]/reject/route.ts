import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let handymanUserId: string | undefined;
  let adminUserId: string | undefined;

  try {
    console.info("[AdminHandymanRejectAPI] step_require_auth", { handymanUserId, adminUserId });
    const auth = await requireAdminApi("workers_write", _req);
    if (!auth.ok) return auth.response;

    adminUserId = auth.session.user.id;
    console.info("[AdminHandymanRejectAPI] step_auth_ok", { handymanUserId, adminUserId });

    const { prisma } = await import("@/lib/db");
    const resolved = await params;
    const id = resolved?.id;
    if (typeof id !== "string" || id.length < 1) {
      return NextResponse.json({ success: false, error: "Nevažeći ID." }, { status: 400 });
    }
    handymanUserId = id;
    console.info("[AdminHandymanRejectAPI] step_params_ok", { handymanUserId, adminUserId });

    console.info("[AdminHandymanRejectAPI] step_find_profile", { handymanUserId, adminUserId });
    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: id },
      select: {
        userId: true,
        user: { select: { id: true, role: true } },
      },
    });

    if (!profile || profile.user.role !== "HANDYMAN") {
      console.info("[AdminHandymanRejectAPI] step_not_found", { handymanUserId, adminUserId });
      return NextResponse.json({ success: false, error: "Majstor nije pronađen" }, { status: 404 });
    }

    console.info("[AdminHandymanRejectAPI] step_transaction_start", { handymanUserId, adminUserId });
    await prisma.$transaction([
      prisma.handymanProfile.update({
        where: { userId: id },
        data: { workerStatus: "BANNED" },
        select: { id: true },
      }),
      prisma.user.update({
        where: { id },
        data: { bannedAt: new Date(), suspendedAt: null },
        select: { id: true },
      }),
    ]);

    console.info("[AdminHandymanRejectAPI] step_audit_start", { handymanUserId, adminUserId });
    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "REJECT_WORKER",
      entityType: "handyman",
      entityId: id,
      newValue: { workerStatus: "BANNED" },
    });

    console.info("[AdminHandymanRejectAPI] step_success", { handymanUserId, adminUserId });
    return NextResponse.json({ success: true, data: { workerStatus: "BANNED" } });
  } catch (e) {
    const code = prismaErrorCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[AdminHandymanRejectAPI] step_fatal", {
      handymanUserId,
      adminUserId,
      prismaCode: code,
      message: msg,
      stack: e instanceof Error ? e.stack : undefined,
      prismaMeta: e instanceof Prisma.PrismaClientKnownRequestError ? e.meta : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Greška pri odbijanju majstora.",
        code: code ?? undefined,
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 500 }
    );
  }
}
