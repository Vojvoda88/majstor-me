import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyAdminsNewPendingRequest } from "@/lib/admin-signals";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Ponovo pošalji admin in-app + push za pending zahtjev (izvršava se na serveru gdje ima VAPID).
 * Koristi se kad je zahtjev kreiran lokalnom skriptom bez env ključeva — in-app već postoji u bazi.
 *
 * curl -X POST "https://www.brzimajstor.me/api/cron/replay-admin-request-notify" \
 *   -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
 *   -d "{\"requestId\":\"...\"}"
 */
export async function POST(req: Request) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { requestId?: string };
    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Nedostaje requestId" }, { status: 400 });
    }

    const request = await prisma.request.findFirst({
      where: { id: requestId, deletedAt: null },
      select: {
        id: true,
        category: true,
        city: true,
        title: true,
        urgency: true,
        adminStatus: true,
      },
    });

    if (!request) {
      return NextResponse.json({ ok: false, error: "Zahtjev nije pronađen" }, { status: 404 });
    }

    if (request.adminStatus !== "PENDING_REVIEW" && request.adminStatus != null) {
      return NextResponse.json(
        { ok: false, error: "Zahtjev nije na čekanju za pregled" },
        { status: 409 }
      );
    }

    await notifyAdminsNewPendingRequest({
      requestId: request.id,
      category: request.category,
      city: request.city,
      title: request.title,
      urgency: request.urgency,
    });

    return NextResponse.json({ ok: true, data: { requestId: request.id } });
  } catch (e) {
    console.error("[cron] replay-admin-request-notify", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
