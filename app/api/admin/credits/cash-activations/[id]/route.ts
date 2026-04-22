import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin/api-auth";

export const dynamic = "force-dynamic";

const statusSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "COMPLETED", "REJECTED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminApi("credits_write", req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Neispravan zahtjev" }, { status: 400 });
    }

    const parsed = statusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Neispravan status" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/db");
    const existing = await prisma.creditCashActivationRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    await prisma.creditCashActivationRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH cash-activation status", e);
    return NextResponse.json({ success: false, error: "Greška pri ažuriranju" }, { status: 500 });
  }
}
