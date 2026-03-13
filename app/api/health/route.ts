import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Health check - tests DB connection.
 * GET /api/health - returns { ok: true } or { ok: false, error: "..." }
 */
export async function GET() {
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Health check failed:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "development" ? msg : "Database error" },
      { status: 500 }
    );
  }
}
