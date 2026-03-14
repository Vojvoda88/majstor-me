import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("POST notifications read-all error", error);
    return NextResponse.json(
      { success: false, error: "Greška" },
      { status: 500 }
    );
  }
}
