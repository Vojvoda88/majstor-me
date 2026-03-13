import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const verifySchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/db");

    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Nemate pristup" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = _request.headers.get("content-type")?.includes("application/json")
      ? await _request.json()
      : {};
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Neispravan status" },
        { status: 400 }
      );
    }

    const profile = await prisma.handymanProfile.update({
      where: { id },
      data: { verifiedStatus: parsed.data.status },
    });

    await prisma.adminAction.create({
      data: {
        adminId: session.user.id,
        targetType: "handyman",
        targetId: id,
        action: `verify_${parsed.data.status.toLowerCase()}`,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Verify handyman error", error);
    }
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
