import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { cityNameToSlug } from "@/lib/content/city-slug";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(2).max(120).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

function canWriteCities(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "OPERATIONS_ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("cities", req);
    if (!auth.ok) return auth.response;
    if (!canWriteCities(auth.adminRole)) {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za izmjenu" }, { status: 403 });
    }

    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(json);
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ success: false, error: "Nema izmjena" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Grad nije pronađen" }, { status: 404 });
    }

    const slug =
      parsed.data.slug?.trim() ||
      (parsed.data.name ? cityNameToSlug(parsed.data.name) : undefined);

    const city = await prisma.city.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(slug ? { slug } : {}),
      },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_CITY",
      entityType: "city",
      entityId: city.id,
      oldValue: existing,
      newValue: city,
    });

    return NextResponse.json({ success: true, city });
  } catch (e) {
    console.error("PATCH /api/admin/cities/[id]", e);
    return NextResponse.json({ success: false, error: "Greška pri ažuriranju" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("cities", req);
    if (!auth.ok) return auth.response;
    if (!canWriteCities(auth.adminRole)) {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za brisanje" }, { status: 403 });
    }

    const { id } = await params;
    const { prisma } = await import("@/lib/db");
    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Grad nije pronađen" }, { status: 404 });
    }

    await prisma.city.delete({ where: { id } });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_CITY",
      entityType: "city",
      entityId: id,
      oldValue: existing,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/cities/[id]", e);
    return NextResponse.json({ success: false, error: "Greška pri brisanju" }, { status: 500 });
  }
}
