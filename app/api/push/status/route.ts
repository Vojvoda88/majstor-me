import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Koliko push pretplata ima trenutno prijavljeni korisnik u bazi (za UI: ne prikazivati „uključeno“ ako je 0).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const count = await prisma.pushSubscription.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, data: { count } });
  } catch {
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
