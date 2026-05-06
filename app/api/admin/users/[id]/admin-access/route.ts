import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedRoles = [
  "OPERATIONS_ADMIN",
  "MODERATION_ADMIN",
  "FINANCE_ADMIN",
  "SUPPORT_ADMIN",
  "READ_ONLY",
] as const;

const roleSchema = z.object({
  adminRole: z.enum(allowedRoles),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi("users_write", request);
    if (!auth.ok) return auth.response;
    if (auth.adminRole !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Samo SUPER_ADMIN može mijenjati admin role." }, { status: 403 });
    }

    const { id } = await params;
    if (id === auth.session.user.id) {
      return NextResponse.json(
        { success: false, error: "Ne možete mijenjati sopstvenu admin rolu kroz ovu akciju." },
        { status: 400 }
      );
    }

    const parsed = roleSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Neispravan unos." },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        adminProfile: { select: { adminRole: true } },
      },
    });

    if (!target) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { role: "ADMIN" } });
      await tx.adminProfile.upsert({
        where: { userId: id },
        update: { adminRole: parsed.data.adminRole },
        create: { userId: id, adminRole: parsed.data.adminRole },
      });
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_USER",
      entityType: "user",
      entityId: id,
      oldValue: { role: target.role, adminRole: target.adminProfile?.adminRole ?? null },
      newValue: { role: "ADMIN", adminRole: parsed.data.adminRole },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change admin role error:", error);
    return NextResponse.json({ success: false, error: "Greška pri promjeni admin role." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi("users_write", request);
    if (!auth.ok) return auth.response;
    if (auth.adminRole !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Samo SUPER_ADMIN može ukinuti admin pristup." }, { status: 403 });
    }

    const { id } = await params;
    if (id === auth.session.user.id) {
      return NextResponse.json({ success: false, error: "Ne možete ukinuti sopstveni admin pristup." }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const target = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        adminProfile: { select: { adminRole: true } },
      },
    });

    if (!target) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminProfile.deleteMany({ where: { userId: id } });
      await tx.user.update({ where: { id }, data: { role: "USER" } });
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_USER",
      entityType: "user",
      entityId: id,
      oldValue: { role: target.role, adminRole: target.adminProfile?.adminRole ?? null },
      newValue: { role: "USER", adminRole: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke admin access error:", error);
    return NextResponse.json({ success: false, error: "Greška pri ukidanju admin pristupa." }, { status: 500 });
  }
}
