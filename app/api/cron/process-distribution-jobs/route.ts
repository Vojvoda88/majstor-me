import { NextResponse } from "next/server";
import { processNextPendingJob } from "@/lib/distribution-job";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Poziva se iz Vercel Cron ili eksternog cron-a.
 * Procesira jedan PENDING distribution job po pozivu.
 * Za više jobova postavite više cron poziva ili loop u jednom pozivu (pažnja na maxDuration).
 */
export async function GET(req: Request) {
  if (IS_PROD && !CRON_SECRET) {
    return NextResponse.json({ error: "Cron nije konfigurisan" }, { status: 503 });
  }
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobId = await processNextPendingJob();
    return NextResponse.json({ ok: true, processed: jobId ?? null });
  } catch (err) {
    console.error("[Cron] process-distribution-jobs error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
