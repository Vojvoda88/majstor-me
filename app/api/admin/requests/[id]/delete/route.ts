import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";

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

    /**
     * Samo `id` — puni findUnique vuče sve kolone iz modela i na produkciji sa schema driftom
     * (npr. nedostaje guest_access_token_hash) baca P2022 → 500.
     */
    const row = await prisma.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!row) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    try {
      await prisma.request.update({
        where: { id },
        data: { adminStatus: "DELETED", deletedAt: new Date() },
      });
    } catch (updateErr) {
      const uc = prismaErrorCode(updateErr);
      if (uc === "P2022") {
        console.warn("[AdminApiDeleteRequest] P2022 on update (npr. nedostaje deleted_at), retry samo adminStatus", {
          requestId: id,
        });
        await prisma.request.update({
          where: { id },
          data: { adminStatus: "DELETED" },
        });
      } else {
        throw updateErr;
      }
    }

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: auth.session.user.id },
      select: { adminRole: true },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: adminProfile?.adminRole ?? "SUPER_ADMIN",
      actionType: "DELETE",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DELETED" },
    });

    return NextResponse.json({ success: true, data: { adminStatus: "DELETED" } });
  } catch (error) {
    const code = prismaErrorCode(error);
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AdminApiDeleteRequest] POST failed", {
      requestId: id,
      prismaCode: code,
      message: msg,
    });
    return NextResponse.json(
      { success: false, error: "Greška", code: code ?? undefined },
      { status: 500 }
    );
  }
}
