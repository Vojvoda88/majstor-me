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
    const auth = await requireAdminApi("workers_write");
    if (!auth.ok) return auth.response;
    adminUserId = auth.session.user.id;

    const { prisma } = await import("@/lib/db");
    const resolved = await params;
    const id = resolved?.id;
    if (typeof id !== "string" || id.length < 1) {
      return NextResponse.json({ success: false, error: "Nevažeći ID." }, { status: 400 });
    }
    handymanUserId = id;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        handymanProfile: { select: { userId: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { bannedAt: new Date(), suspendedAt: null },
        select: { id: true },
      });
      if (user.handymanProfile) {
        await tx.handymanProfile.update({
          where: { userId: id },
          data: { workerStatus: "BANNED" },
          select: { id: true },
        });
      }
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "BAN",
      entityType: "handyman",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    const code = prismaErrorCode(e);
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[AdminHandymanBanAPI] fatal", {
      handymanUserId,
      adminUserId,
      prismaCode: code,
      message: msg,
      prismaMeta: e instanceof Prisma.PrismaClientKnownRequestError ? e.meta : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Greška pri banovanju.",
        code: code ?? undefined,
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 500 }
    );
  }
}
