import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { createHandymanChurnEvent } from "@/lib/handyman-churn";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("users_write", _req);
  if (!auth.ok) return auth.response;

  const { id } = await params;

  if (id === auth.session.user.id) {
    return NextResponse.json(
      { success: false, error: "Ne možete obrisati vlastiti nalog" },
      { status: 400 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen" }, { status: 404 });
    }

    if (user.role === "HANDYMAN") {
      await prisma.$transaction(async (tx) => {
        await createHandymanChurnEvent(tx, {
          userId: user.id,
          emailSnapshot: user.email,
          nameSnapshot: user.name,
          reason: "ADMIN_DELETE",
          actorType: "ADMIN",
          actorUserId: auth.session.user.id,
          metadata: { source: "admin_delete_user_endpoint" },
        });
        await tx.user.delete({ where: { id } });
      });
    } else {
      await prisma.user.delete({ where: { id } });
    }

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "DELETE",
      entityType: "user",
      entityId: id,
      newValue: { deleted: true, email: user.email, role: user.role },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete user error:", e);
    return NextResponse.json(
      { success: false, error: "Greška pri brisanju" },
      { status: 500 }
    );
  }
}
