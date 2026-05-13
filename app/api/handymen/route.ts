import { NextRequest, NextResponse } from "next/server";
import { getPublicHandymenList } from "@/lib/handymen-listing";
import { withPerfLog } from "@/lib/perf";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const LISTING_CACHE_HEADERS = {
  // Kratak CDN cache za iste query kombinacije; ubrzava javne listinge bez velikog rizika zastarjelosti.
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const categoryParam = searchParams.get("category");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sort") || searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limitRaw = searchParams.get("limit");
    const limitParsed =
      limitRaw != null && limitRaw !== "" ? parseInt(limitRaw, 10) : undefined;

    const result = await withPerfLog("api.handymen.getPublicHandymenList", () =>
      getPublicHandymenList({
        category: categoryParam,
        city: city || undefined,
        sortBy,
        page,
        limit: limitParsed !== undefined && Number.isFinite(limitParsed) ? limitParsed : undefined,
      })
    );

    return NextResponse.json(
      {
        items: result.items,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
      {
        headers: LISTING_CACHE_HEADERS,
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch handymen" }, { status: 500 });
  }
}
