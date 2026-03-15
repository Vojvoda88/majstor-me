import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi("users_write");
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

    await prisma.user.delete({ where: { id } });

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
