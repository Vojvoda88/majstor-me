import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ reason: z.string().optional() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("requests_write", req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    const request = await prisma.request.findUnique({
      where: { id },
      select: { id: true, adminStatus: true },
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (!["PENDING_REVIEW", null].includes(request.adminStatus)) {
      return NextResponse.json(
        { success: false, error: "Zahtjev nije na čekanju" },
        { status: 400 }
      );
    }

    try {
      await prisma.request.update({
        where: { id },
        data: { adminStatus: "DELETED", deletedAt: new Date() },
        select: { id: true },
      });
    } catch (updateErr) {
      if (prismaErrorCode(updateErr) === "P2022") {
        await prisma.request.update({
          where: { id },
          data: { adminStatus: "DELETED" },
          select: { id: true },
        });
      } else {
        throw updateErr;
      }
    }

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "REJECT_REQUEST",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DELETED" },
      reason: reason ?? undefined,
    });

    return NextResponse.json({ success: true, data: { adminStatus: "DELETED" } });
  } catch (error) {
    console.error("Reject request error:", error);
    return NextResponse.json(
      { success: false, error: "Greška pri odbijanju" },
      { status: 500 }
    );
  }
}
