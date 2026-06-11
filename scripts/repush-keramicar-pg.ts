/**
 * Ponovno obavještenje keramičara u Podgorici za konkretan zahtjev.
 * Usage: npx tsx scripts/repush-keramicar-pg.ts [requestId]
 */
import { PrismaClient } from "@prisma/client";
import { dbCategoryNamesForDistributionFilter } from "../lib/categories";
import { buildHandymanNewRequestNotifyMessages, handymanNotifyVariantForRequest } from "../lib/handyman-request-notify-copy";
import { createNotificationsBulk } from "../lib/notifications";
import { sendPushToUser } from "../lib/push";
import { prismaWhereUserActiveHandymanWithProfileExtra } from "../lib/handyman-truth";

const prisma = new PrismaClient();
const REQUEST_ID = process.argv[2] ?? "cmppo2usp000m97y2t2n4ceau";
const REMINDER_SUFFIX = "reminder-20260529";

function worksPodgorica(city: string | null, cities: string[] | null | undefined): boolean {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const all = [city, ...(cities ?? [])].filter(Boolean) as string[];
  return all.some((c) => norm(c).includes("podgorica"));
}

async function main() {
  const request = await prisma.request.findUnique({
    where: { id: REQUEST_ID },
    select: { id: true, title: true, category: true, city: true, adminStatus: true },
  });
  if (!request) {
    console.error("Zahtjev nije pronađen:", REQUEST_ID);
    process.exit(1);
  }

  const dbNames = dbCategoryNamesForDistributionFilter(request.category);
  const allKeramicars = await prisma.user.findMany({
    where: prismaWhereUserActiveHandymanWithProfileExtra({
      workerCategories: { some: { category: { name: { in: dbNames } } } },
    }),
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      pushSubscriptions: { select: { id: true } },
      handymanProfile: { select: { cities: true } },
    },
    orderBy: { name: "asc" },
  });

  const pgKeramicars = allKeramicars.filter((u) =>
    worksPodgorica(u.city, u.handymanProfile?.cities)
  );

  const withPush = pgKeramicars.filter((u) => u.pushSubscriptions.length > 0);
  const withoutPush = pgKeramicars.filter((u) => u.pushSubscriptions.length === 0);

  console.log("=== PG KERAMIČARI ===");
  console.log("Ukupno:", pgKeramicars.length);
  console.log("Sa push:", withPush.length);
  console.log("Bez push:", withoutPush.length);
  console.log("\nBez push:");
  for (const u of withoutPush) {
    console.log(`  ${u.name}\t${u.phone ?? "-"}\t${u.email}`);
  }

  const variant = handymanNotifyVariantForRequest(request.id);
  const { title, body } = buildHandymanNewRequestNotifyMessages(variant, "Keramičar");
  const link = `/request/${request.id}`;
  const pushBodyShort = body.replace(/\s+/g, " ").trim().slice(0, 220);

  await createNotificationsBulk(
    pgKeramicars.map((h) => ({
      userId: h.id,
      type: "NEW_JOB" as const,
      title,
      body: body.slice(0, 200),
      link,
      idempotencyKey: `new-job-${REMINDER_SUFFIX}:${request.id}:${h.id}`,
    }))
  );

  const pushResults = await Promise.allSettled(
    pgKeramicars.map((h) =>
      sendPushToUser(
        prisma,
        h.id,
        {
          title,
          body: pushBodyShort,
          link,
          tag: `new-job-${REMINDER_SUFFIX}-${request.id}`,
        },
        { requestId: request.id }
      )
    )
  );

  const pushOk = pushResults.filter((r) => r.status === "fulfilled").length;
  const pushFail = pushResults.filter((r) => r.status === "rejected").length;

  console.log("\n=== POSLATO ===");
  console.log("In-app notifikacije:", pgKeramicars.length);
  console.log("Push pokušaja:", pgKeramicars.length, "| uspjeh:", pushOk, "| fail:", pushFail);
  console.log("Push stvarno na uređaje (ima pretplatu):", withPush.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
