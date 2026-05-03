import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminPendingReviewCounts } from "@/lib/admin-pending-counts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Lagan odgovor za client u admin shellu — ne blokira SSR layout.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const counts = await getAdminPendingReviewCounts();
    return NextResponse.json(counts, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { pendingRequests: 0, pendingHandymen: 0, urgentPendingRequests: 0 },
      { status: 200 }
    );
  }
}
