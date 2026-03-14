import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { createAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

const schema = z.object({ amount: z.number().int().refine((n) => n !== 0, "Iznos ne smije biti 0") });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("credits_write");
    if (!auth.ok) return auth.response;

    const { prisma } = await import("@/lib/db");
    const { id: handymanUserId } = await params;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Neispravan iznos" }, { status: 400 });
    }

    const profile = await prisma.handymanProfile.findUnique({
      where: { userId: handymanUserId },
    });
    if (!profile) return NextResponse.json({ success: false, error: "Majstor nije pronađen" }, { status: 404 });

    const balanceBefore = profile.creditsBalance;
    const newBalance = Math.max(0, balanceBefore + parsed.data.amount);

    await prisma.$transaction([
      prisma.handymanProfile.update({
        where: { userId: handymanUserId },
        data: { creditsBalance: newBalance },
      }),
      prisma.creditTransaction.create({
        data: {
          handymanId: handymanUserId,
          amount: parsed.data.amount,
          type: parsed.data.amount > 0 ? "ADMIN_ADD" : "ADMIN_REMOVE",
          balanceBefore,
          balanceAfter: newBalance,
          reason: `Admin akcija`,
          createdByAdminId: auth.session.user.id,
        },
      }),
    ]);

    await createAuditLog(prisma, {
      adminId: auth.session.user.id,
      adminRole: auth.adminRole,
      actionType: parsed.data.amount > 0 ? "ADD_CREDITS" : "REMOVE_CREDITS",
      entityType: "credit_transaction",
      entityId: handymanUserId,
      oldValue: { balance: balanceBefore },
      newValue: { balance: newBalance, amount: parsed.data.amount },
    });

    return NextResponse.json({ success: true, balanceAfter: newBalance });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
