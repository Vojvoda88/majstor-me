import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  phone: z.string().min(6, "Unesite broj telefona"),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAdminApi("trust_safety");
  if (!auth.ok) return auth.response;

  try {
    const { prisma } = await import("@/lib/db");
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message ?? "Neispravan unos" },
        { status: 400 }
      );
    }

    const phoneNorm = parsed.data.phone.replace(/\D/g, "").trim() || parsed.data.phone.trim();

    const allBlacklisted = await prisma.blacklistedPhone.findMany({ select: { phone: true } });
    const exists = allBlacklisted.some((b) => b.phone.replace(/\D/g, "") === phoneNorm.replace(/\D/g, ""));

    if (exists) {
      return NextResponse.json(
        { success: false, error: "Broj je već na blacklisti" },
        { status: 400 }
      );
    }

    const rec = await prisma.blacklistedPhone.create({
      data: {
        phone: phoneNorm,
        reason: parsed.data.reason ?? null,
        addedById: auth.session.user.id,
      },
    });

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: auth.session.user.id },
      select: { adminRole: true },
    });

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: adminProfile?.adminRole ?? "SUPER_ADMIN",
      actionType: "BLACKLIST_PHONE",
      entityType: "blacklist",
      entityId: rec.id,
      newValue: { phone: rec.phone, reason: rec.reason },
    });

    return NextResponse.json({ success: true, data: rec });
  } catch (error) {
    console.error("Blacklist phone error:", error);
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
