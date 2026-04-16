import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni." }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const delivered = await sendPushToUser(prisma, session.user.id, {
      title: "Test obavještenje",
      body: "Push je uspješno povezan na ovom uređaju.",
      link: session.user.role === "HANDYMAN" ? "/dashboard/handyman" : session.user.role === "USER" ? "/dashboard/user" : "/admin",
      tag: `push-test-${session.user.id}`,
    });

    if (delivered < 1) {
      return NextResponse.json(
        { success: false, error: "Nijedna push pretplata nije primila test obavještenje." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, data: { delivered } });
  } catch {
    return NextResponse.json({ success: false, error: "Greška pri slanju test obavještenja." }, { status: 500 });
  }
}
