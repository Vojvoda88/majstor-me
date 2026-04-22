import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { prismaErrorCode } from "@/lib/admin/admin-ssr-params";

export const dynamic = "force-dynamic";

/** Prvi update (deletedAt + adminStatus) može pasti na drift; drugi samo enum kolona. */
function shouldRetrySoftDeleteWithoutDeletedAt(err: unknown): boolean {
  const code = prismaErrorCode(err);
  if (code === "P2022") return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /deleted_at|Unknown column|does not exist|column/i.test(msg);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let requestId: string | undefined;
  let adminUserId: string | undefined;

  try {
    console.info("[AdminRequestDeleteAPI] step_require_auth", { requestId, adminUserId });
    const auth = await requireAdminApi("requests_write", _req);
    if (!auth.ok) return auth.response;

    adminUserId = auth.session.user.id;
    console.info("[AdminRequestDeleteAPI] step_auth_ok", { requestId, adminUserId });

    console.info("[AdminRequestDeleteAPI] step_resolve_params", { requestId, adminUserId });
    const resolved = await params;
    const id = resolved?.id;
    if (typeof id !== "string" || id.length < 1) {
      console.info("[AdminRequestDeleteAPI] step_params_invalid", { requestId, adminUserId });
      return NextResponse.json({ success: false, error: "Nevažeći ID zahtjeva." }, { status: 400 });
    }
    requestId = id;

    console.info("[AdminRequestDeleteAPI] step_prisma_import", { requestId, adminUserId });
    const { prisma } = await import("@/lib/db");

    console.info("[AdminRequestDeleteAPI] step_find_request", { requestId, adminUserId });
    const row = await prisma.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!row) {
      console.info("[AdminRequestDeleteAPI] step_request_not_found", { requestId, adminUserId });
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    console.info("[AdminRequestDeleteAPI] step_update_start", { requestId, adminUserId });
    try {
      await prisma.request.update({
        where: { id },
        data: { adminStatus: "DELETED", deletedAt: new Date() },
        select: { id: true },
      });
    } catch (updateErr) {
      const uc = prismaErrorCode(updateErr);
      const msg = updateErr instanceof Error ? updateErr.message : String(updateErr);
      const stack = updateErr instanceof Error ? updateErr.stack : undefined;
      console.warn("[AdminRequestDeleteAPI] step_update_first_failed", {
        requestId,
        adminUserId,
        prismaCode: uc,
        message: msg,
        stack,
        prismaMeta: updateErr instanceof Prisma.PrismaClientKnownRequestError ? updateErr.meta : undefined,
      });
      if (shouldRetrySoftDeleteWithoutDeletedAt(updateErr)) {
        console.info("[AdminRequestDeleteAPI] step_update_retry_admin_status_only", { requestId, adminUserId });
        await prisma.request.update({
          where: { id },
          data: { adminStatus: "DELETED" },
          select: { id: true },
        });
      } else {
        throw updateErr;
      }
    }

    console.info("[AdminRequestDeleteAPI] step_audit_start", { requestId, adminUserId });
    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "DELETE",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "DELETED" },
    });

    console.info("[AdminRequestDeleteAPI] step_success", { requestId, adminUserId });
    return NextResponse.json({ success: true, data: { adminStatus: "DELETED" } });
  } catch (error) {
    const code = prismaErrorCode(error);
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AdminRequestDeleteAPI] step_fatal", {
      requestId,
      adminUserId,
      prismaCode: code,
      message: msg,
      stack: error instanceof Error ? error.stack : undefined,
      prismaMeta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        error:
          code === "P2022"
            ? "Neusklađena šema baze (kolona). Kontaktirajte podršku."
            : "Greška pri brisanju zahtjeva.",
        code: code ?? undefined,
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
      },
      { status: 500 }
    );
  }
}
