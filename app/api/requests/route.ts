import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import { authFromNextRequest } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { createRequestShared } from "@/lib/requests/create-request-shared";

export async function GET(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const status = searchParams.get("status") ?? "OPEN";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE))), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status,
      OR: [{ adminStatus: "DISTRIBUTED" }, { adminStatus: null }],
    };
    if (category) where.category = category;
    if (city) where.city = city;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          user: { select: { name: true, city: true } },
          offers: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { requests, total, page, limit },
    });
  } catch (error) {
    logError("GET requests error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri učitavanju zahtjeva" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await authFromNextRequest(request);
    const body = await request.json();
    const result = await createRequestShared(session, body);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logError("POST request error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri kreiranju zahtjeva" },
      { status: 500 }
    );
  }
}
