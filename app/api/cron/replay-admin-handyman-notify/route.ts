import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyAdminsNewPendingHandyman } from "@/lib/admin-signals";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Ponovo pošalji admin in-app + push za prijavu majstora (Vercel / VAPID).
 * Npr. kad je majstor kreiran lokalnom skriptom bez ključeva.
 *
 * curl -X POST "https://www.brzimajstor.me/api/cron/replay-admin-handyman-notify" \
 *   -H "Authorization: Bearer $CRON_SECRET" -H "Content-Type: application/json" \
 *   -d "{\"handymanUserId\":\"...\"}"
 */
export async function POST(req: Request) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { handymanUserId?: string };
    const handymanUserId = typeof body.handymanUserId === "string" ? body.handymanUserId.trim() : "";
    if (!handymanUserId) {
      return NextResponse.json({ ok: false, error: "Nedostaje handymanUserId" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: handymanUserId, role: "HANDYMAN" },
      select: {
        id: true,
        name: true,
        handymanProfile: { select: { workerStatus: true } },
      },
    });

    if (!user?.handymanProfile) {
      return NextResponse.json({ ok: false, error: "Majstor nije pronađen" }, { status: 404 });
    }

    if (user.handymanProfile.workerStatus !== "PENDING_REVIEW") {
      return NextResponse.json(
        { ok: false, error: "Profil nije na čekanju za pregled" },
        { status: 409 }
      );
    }

    await notifyAdminsNewPendingHandyman({
      handymanUserId: user.id,
      displayName: user.name?.trim() || "Majstor",
    });

    return NextResponse.json({ ok: true, data: { handymanUserId: user.id } });
  } catch (e) {
    console.error("[cron] replay-admin-handyman-notify", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
