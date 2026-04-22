import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/api-auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi("users_write", request);
    if (!auth.ok) return auth.response;
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
