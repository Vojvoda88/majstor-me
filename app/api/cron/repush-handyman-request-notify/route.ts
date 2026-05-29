import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { repushHandymanRequestNotify } from "@/lib/repush-handyman-request-notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Ponovo pošalji majstorima obavještenje za konkretan zahtjev (in-app +/ili push).
 * Izvršava se na serveru gdje ima VAPID ključeva.
 *
 * curl -X POST "https://www.brzimajstor.me/api/cron/repush-handyman-request-notify" \
 *   -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
 *   -d "{\"requestId\":\"...\",\"onlyWithPush\":true,\"pushOnly\":true,\"cityFilter\":\"podgorica\"}"
 */
export async function POST(req: Request) {
  if (IS_PROD && !CRON_SECRET) {
    return NextResponse.json({ error: "Cron nije konfigurisan" }, { status: 503 });
  }
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      requestId?: string;
      onlyWithPush?: boolean;
      pushOnly?: boolean;
      cityFilter?: string;
      reminderSuffix?: string;
    };

    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    if (!requestId) {
      return NextResponse.json({ ok: false, error: "Nedostaje requestId" }, { status: 400 });
    }

    const result = await repushHandymanRequestNotify(prisma, {
      requestId,
      onlyWithPush: body.onlyWithPush === true,
      pushOnly: body.pushOnly === true,
      cityFilter: typeof body.cityFilter === "string" ? body.cityFilter : undefined,
      reminderSuffix:
        typeof body.reminderSuffix === "string" ? body.reminderSuffix : undefined,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (e) {
    console.error("[cron] repush-handyman-request-notify", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
