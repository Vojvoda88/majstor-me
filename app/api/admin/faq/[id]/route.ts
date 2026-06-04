import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  question: z.string().trim().min(3).max(500).optional(),
  answer: z.string().trim().min(3).max(5000).optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("content_write", req);
    if (!auth.ok) return auth.response;

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
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stavka nije pronađena" }, { status: 404 });
    }

    const item = await prisma.faqItem.update({
      where: { id },
      data: parsed.data,
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_FAQ",
      entityType: "faq",
      entityId: item.id,
      oldValue: existing,
      newValue: item,
    });

    return NextResponse.json({ success: true, item });
  } catch (e) {
    console.error("PATCH /api/admin/faq/[id]", e);
    return NextResponse.json({ success: false, error: "Greška pri ažuriranju" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("content_write", req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const { prisma } = await import("@/lib/db");
    const existing = await prisma.faqItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Stavka nije pronađena" }, { status: 404 });
    }

    await prisma.faqItem.delete({ where: { id } });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_FAQ",
      entityType: "faq",
      entityId: id,
      oldValue: existing,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/faq/[id]", e);
    return NextResponse.json({ success: false, error: "Greška pri brisanju" }, { status: 500 });
  }
}
