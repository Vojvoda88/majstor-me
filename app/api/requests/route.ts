import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import { auth, authFromNextRequest } from "@/lib/auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { createRequestShared } from "@/lib/requests/create-request-shared";

const PUBLIC_REQUEST_LIST_SELECT = {
  id: true,
  category: true,
  subcategory: true,
  title: true,
  city: true,
  urgency: true,
  status: true,
  createdAt: true,
  user: { select: { name: true, city: true } },
  offers: { select: { id: true } },
} as const;

const EXTENDED_REQUEST_LIST_SELECT = {
  ...PUBLIC_REQUEST_LIST_SELECT,
  description: true,
  photos: true,
} as const;

export async function GET(request: Request) {
  try {
    const session = await auth();
    const canSeeExtended = session?.user?.role === "HANDYMAN" || session?.user?.role === "ADMIN";
    const { prisma } = await import("@/lib/db");
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const rawStatus = searchParams.get("status");
    const status =
      rawStatus && ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(rawStatus)
        ? rawStatus
        : "OPEN";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE))), 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status,
      deletedAt: null,
      OR: [
        { adminStatus: "DISTRIBUTED" },
        { adminStatus: "HAS_OFFERS" },
        { adminStatus: "CONTACT_UNLOCKED" },
        { adminStatus: null },
      ],
    };
    if (category) where.category = category;
    if (city) where.city = city;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        select: canSeeExtended ? EXTENDED_REQUEST_LIST_SELECT : PUBLIC_REQUEST_LIST_SELECT,
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
