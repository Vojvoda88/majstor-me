/**
 * Debug push isporuke:
 * - provjera VAPID konfiguracije
 * - pregled zadnjih push pretplata
 * - opcionalno slanje testa za korisnika po email-u
 *
 * Primjeri:
 *   npx tsx scripts/debug-push-delivery.ts
 *   npx tsx scripts/debug-push-delivery.ts --email=hitni.majstor.1776419278832@test.me
 */
import { PrismaClient } from "@prisma/client";
import { getPushServerConfig, sendPushNotification } from "@/lib/push";

const prisma = new PrismaClient();

function parseEmailArg(): string | null {
  const arg = process.argv.find((a) => a.startsWith("--email="));
  if (!arg) return null;
  const value = arg.slice("--email=".length).trim();
  return value.length > 0 ? value : null;
}

async function printOverview() {
  const config = getPushServerConfig();
  const total = await prisma.pushSubscription.count();
  console.log("[push-debug] server config", config);
  console.log("[push-debug] total subscriptions:", total);

  const recent = await prisma.pushSubscription.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      endpoint: true,
      createdAt: true,
      user: { select: { id: true, email: true, role: true } },
    },
  });

  console.log("[push-debug] recent subscriptions:");
  for (const sub of recent) {
    console.log(
      JSON.stringify(
        {
          id: sub.id,
          createdAt: sub.createdAt,
          endpointPrefix: sub.endpoint.slice(0, 70),
          user: sub.user,
        },
        null,
        2
      )
    );
  }
}

async function sendForEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    console.error("[push-debug] user not found:", email);
    process.exitCode = 1;
    return;
  }

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: user.id },
    select: { id: true, endpoint: true, p256dh: true, auth: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  console.log(`[push-debug] user=${user.email} role=${user.role} subscriptions=${subs.length}`);
  if (subs.length === 0) {
    console.log("[push-debug] Nema pretplata za tog korisnika.");
    return;
  }

  let ok = 0;
  for (const sub of subs) {
    const result = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      {
        title: "Debug test obavještenje",
        body: "Ako ovo vidite, server->push servis->telefon putanja radi.",
        link: user.role === "HANDYMAN" ? "/dashboard/handyman" : user.role === "ADMIN" ? "/admin" : "/dashboard/user",
        tag: `push-debug-${Date.now()}`,
      }
    );
    if (result.ok) ok++;
    console.log(
      JSON.stringify(
        {
          subscriptionId: sub.id,
          endpointPrefix: sub.endpoint.slice(0, 70),
          sent: result.ok,
          statusCode: result.ok ? undefined : result.statusCode,
        },
        null,
        2
      )
    );
  }

  console.log(`[push-debug] deliveries ok: ${ok}/${subs.length}`);
}

async function main() {
  await printOverview();
  const email = parseEmailArg();
  if (email) {
    await sendForEmail(email);
  }
}

main()
  .catch((e) => {
    console.error("[push-debug] fatal", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

