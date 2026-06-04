import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";
import { cityNameToSlug } from "@/lib/content/city-slug";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi("cities", req);
    if (!auth.ok) return auth.response;
    if (auth.adminRole === "READ_ONLY") {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za izmjenu" }, { status: 403 });
    }
    if (auth.adminRole !== "SUPER_ADMIN" && auth.adminRole !== "OPERATIONS_ADMIN") {
      return NextResponse.json({ success: false, error: "Nemate dozvolu za izmjenu" }, { status: 403 });
    }

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

    const slug = parsed.data.slug?.trim() || cityNameToSlug(parsed.data.name);
    if (!slug) {
      return NextResponse.json({ success: false, error: "Neispravan slug" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const maxSort = await prisma.city.aggregate({ _max: { sortOrder: true } });
    const sortOrder = parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;

    const city = await prisma.city.create({
      data: {
        name: parsed.data.name,
        slug,
        active: parsed.data.active ?? true,
        sortOrder,
      },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "EDIT_CITY",
      entityType: "city",
      entityId: city.id,
      newValue: city,
    });

    return NextResponse.json({ success: true, city });
  } catch (e) {
    console.error("POST /api/admin/cities", e);
    return NextResponse.json({ success: false, error: "Greška pri kreiranju grada" }, { status: 500 });
  }
}
