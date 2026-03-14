import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("POST notification read error", error);
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
