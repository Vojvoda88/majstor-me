import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/logger";
import { z } from "zod";
import { isRateLimited, getRetryAfterSeconds } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/request-ip";
import { getPushServerConfig } from "@/lib/push";

export const dynamic = "force-dynamic";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    const pushConfig = getPushServerConfig();
    if (!pushConfig.canSend) {
      const details = !pushConfig.hasPublicKey
        ? "Nedostaje VAPID_PUBLIC_KEY."
        : !pushConfig.hasPrivateKey
          ? "Nedostaje VAPID_PRIVATE_KEY."
          : "VAPID konfiguracija nije validna.";
      return NextResponse.json(
        {
          success: false,
          error: `Push server nije kompletno podešen. ${details}`,
        },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Morate biti prijavljeni" },
        { status: 401 }
      );
    }
    if (session.user.role !== "HANDYMAN" && session.user.role !== "USER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Obavještenja na ovom uređaju dostupna su prijavljenim korisnicima, majstorima i administratorima" },
        { status: 403 }
      );
    }

    const ip = getRequestClientIp(request);
    const rlKey = `push-sub:user:${session.user.id}:ip:${ip}`;
    if (isRateLimited(rlKey, 30, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Previše pokušaja pretplate. Pokušajte kasnije." },
        { status: 429, headers: { "Retry-After": String(getRetryAfterSeconds(rlKey)) } }
      );
    }

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Neispravan format pretplate" },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/db");
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await prisma.pushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      create: {
        userId: session.user.id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
      update: {
        userId: session.user.id,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        userAgent,
      },
    });

    console.info("[push] subscribe saved", {
      userId: session.user.id,
      role: session.user.role,
      endpointPrefix: parsed.data.endpoint.slice(0, 56),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Push subscribe error", error);
    return NextResponse.json(
      { success: false, error: "Greška pri pretplati" },
      { status: 500 }
    );
  }
}
