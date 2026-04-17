import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPushNotification, sendPushToUser } from "@/lib/push";
import { getPushServerConfig } from "@/lib/push";
import { z } from "zod";

export const dynamic = "force-dynamic";

const testPushBodySchema = z
  .object({
    endpoint: z.string().url().optional(),
  })
  .optional();

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
      return NextResponse.json({ success: false, error: "Morate biti prijavljeni." }, { status: 401 });
    }

    let rawBody: unknown = undefined;
    try {
      rawBody = await request.json();
    } catch {
      rawBody = undefined;
    }
    const parsedBody = testPushBodySchema.safeParse(rawBody);
    const targetEndpoint = parsedBody.success ? parsedBody.data?.endpoint : undefined;

    const { prisma } = await import("@/lib/db");
    const payload = {
      title: "Test obavještenje",
      body: "Push je uspješno povezan na ovom uređaju.",
      link: session.user.role === "HANDYMAN" ? "/dashboard/handyman" : session.user.role === "USER" ? "/dashboard/user" : "/admin",
      tag: `push-test-${session.user.id}`,
    };

    if (targetEndpoint) {
      const sub = await prisma.pushSubscription.findFirst({
        where: {
          userId: session.user.id,
          endpoint: targetEndpoint,
        },
        select: { endpoint: true, p256dh: true, auth: true },
      });
      if (!sub) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ovaj uređaj nema aktivnu push pretplatu za nalog. Kliknite ponovo 'Uključi obavještenja'.",
          },
          { status: 404 }
        );
      }

      const result = await sendPushNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      if (!result.ok) {
        if (result.statusCode === 400 || result.statusCode === 401 || result.statusCode === 403 || result.statusCode === 404 || result.statusCode === 410) {
          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
        }
        return NextResponse.json(
          {
            success: false,
            error: "Test push nije isporučen na ovom uređaju.",
            details: {
              statusCode: result.statusCode ?? null,
              message: result.errorMessage ?? null,
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ success: true, data: { delivered: 1, target: "current-device" } });
    }

    const delivered = await sendPushToUser(prisma, session.user.id, payload);

    if (delivered < 1) {
      return NextResponse.json(
        { success: false, error: "Nijedna push pretplata nije primila test obavještenje." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, data: { delivered, target: "all-user-devices" } });
  } catch {
    return NextResponse.json({ success: false, error: "Greška pri slanju test obavještenja." }, { status: 500 });
  }
}
