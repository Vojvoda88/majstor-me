import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  question: z.string().trim().min(3).max(500),
  answer: z.string().trim().min(3).max(5000),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  active: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi("content_write", req);
    if (!auth.ok) return auth.response;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Neispravni podaci" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const maxSort = await prisma.faqItem.aggregate({ _max: { sortOrder: true } });
    const sortOrder = parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;

    const item = await prisma.faqItem.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        sortOrder,
        active: parsed.data.active ?? true,
      },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_FAQ",
      entityType: "faq",
      entityId: item.id,
      newValue: item,
    });

    return NextResponse.json({ success: true, item });
  } catch (e) {
    console.error("POST /api/admin/faq", e);
    return NextResponse.json({ success: false, error: "Greška pri kreiranju" }, { status: 500 });
  }
}
