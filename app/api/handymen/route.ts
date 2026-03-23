import { NextRequest, NextResponse } from "next/server";
import { getPublicHandymenList } from "@/lib/handymen-listing";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl?.searchParams ?? new URLSearchParams();
    const categoryParam = searchParams.get("category");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limitRaw = searchParams.get("limit");
    const limitParsed =
      limitRaw != null && limitRaw !== "" ? parseInt(limitRaw, 10) : undefined;

    const result = await getPublicHandymenList({
      category: categoryParam,
      city: city || undefined,
      sortBy,
      page,
      limit: limitParsed !== undefined && Number.isFinite(limitParsed) ? limitParsed : undefined,
    });

    return NextResponse.json({
      items: result.items,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      handymen: result.items,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch handymen" }, { status: 500 });
  }
}
