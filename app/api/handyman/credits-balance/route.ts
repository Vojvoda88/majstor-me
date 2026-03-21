import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Brzi saldo kredita za header (majstori). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "HANDYMAN") {
    return NextResponse.json({ ok: false, balance: null }, { status: 403 });
  }
  const { prisma } = await import("@/lib/db");
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: session.user.id },
    select: { creditsBalance: true },
  });
  return NextResponse.json({
    ok: true,
    balance: profile?.creditsBalance ?? 0,
  });
}
