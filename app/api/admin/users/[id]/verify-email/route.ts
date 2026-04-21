import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminPermission("users");
    const { id } = await params;
    const { prisma } = await import("@/lib/db");

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, emailVerified: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Korisnik nije pronađen" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: {
        emailVerified: user.emailVerified ?? new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("POST admin verify-email error", error);
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
