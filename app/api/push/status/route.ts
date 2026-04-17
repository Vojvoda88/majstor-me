 import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPushServerConfig } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * Koliko push pretplata ima trenutno prijavljeni korisnik u bazi (za UI: ne prikazivati „uključeno“ ako je 0).
 */
export async function GET() {
  try {
    const pushConfig = getPushServerConfig();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const count = await prisma.pushSubscription.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        count,
        serverCanSendPush: pushConfig.canSend,
        /** Za PushManager.subscribe — uvijek aktuelan ključ sa servera. */
        vapidPublicKey: pushConfig.hasPublicKey ? pushConfig.publicKeyNormalized : "",
        vapid: {
          hasPublicKey: pushConfig.hasPublicKey,
          hasPrivateKey: pushConfig.hasPrivateKey,
          hasClientPublicKey: pushConfig.hasClientPublicKey,
          publicKeysMatch: pushConfig.publicKeysMatch,
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Greška" }, { status: 500 });
  }
}
