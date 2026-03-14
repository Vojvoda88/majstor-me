import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
    });
  } catch (error) {
    logError("GET notifications error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju notifikacija" },
      { status: 500 }
    );
  }
}
