import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Briše nalog trenutno prijavljenog korisnika.
 * Dostupno samo za USER i HANDYMAN (ne i za ADMIN).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Niste prijavljeni" }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Admin nalog se ne može obrisati ovdje. Koristite admin panel." },
      { status: 400 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");

    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete account error:", e);
    return NextResponse.json(
      { success: false, error: "Greška pri brisanju naloga" },
      { status: 500 }
    );
  }
}
