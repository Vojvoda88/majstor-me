import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[A-Z0-9_]+$/),
  value: z.string().max(10000),
});

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdminApi("settings_write", req);
    if (!auth.ok) return auth.response;

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Neispravni podaci (ključ: VELIKA_SLOVA)" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const existing = await prisma.systemSetting.findUnique({ where: { key: parsed.data.key } });

    const setting = await prisma.systemSetting.upsert({
      where: { key: parsed.data.key },
      create: { key: parsed.data.key, value: parsed.data.value },
      update: { value: parsed.data.value },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: "SETTINGS_CHANGE",
      entityType: "settings",
      entityId: setting.id,
      oldValue: existing,
      newValue: setting,
    });

    return NextResponse.json({ success: true, setting });
  } catch (e) {
    console.error("PATCH /api/admin/settings", e);
    return NextResponse.json({ success: false, error: "Greška pri spremanju" }, { status: 500 });
  }
}
