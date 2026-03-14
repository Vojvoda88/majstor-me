import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

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

    const request = await prisma.request.findUnique({ where: { id } });

    if (!request) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    await prisma.request.update({
      where: { id },
      data: { adminStatus: "SPAM" },
    });

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: auth.session.user.id },
      select: { adminRole: true },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: adminProfile?.adminRole ?? "SUPER_ADMIN",
      actionType: "MARK_SPAM",
      entityType: "request",
      entityId: id,
      newValue: { adminStatus: "SPAM" },
    });

    return NextResponse.json({ success: true, data: { adminStatus: "SPAM" } });
  } catch (error) {
    console.error("Mark spam error:", error);
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
