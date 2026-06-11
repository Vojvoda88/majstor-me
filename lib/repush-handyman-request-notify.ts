import type { PrismaClient } from "@prisma/client";
import { dbCategoryNamesForDistributionFilter, displayLabelForRequestCategory } from "@/lib/categories";
import {
  buildHandymanNewRequestNotifyMessages,
  handymanNotifyVariantForRequest,
} from "@/lib/handyman-request-notify-copy";
import { createNotificationsBulk } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { prismaWhereUserActiveHandymanWithProfileExtra } from "@/lib/handyman-truth";

export function handymanWorksInCity(
  city: string | null,
  cities: string[] | null | undefined,
  cityNeedle: string
): boolean {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const needle = norm(cityNeedle);
  const all = [city, ...(cities ?? [])].filter(Boolean) as string[];
  return all.some((c) => norm(c).includes(needle));
}

export type RepushHandymanRequestNotifyOptions = {
  requestId: string;
  /** Samo majstori sa push pretplatom */
  onlyWithPush?: boolean;
  /** Samo push (bez ponovnog in-app) */
  pushOnly?: boolean;
  /** Filtriraj po gradu (npr. "podgorica") */
  cityFilter?: string;
  /** Sufiks za idempotency/tag (npr. reminder-push2-20260529) */
  reminderSuffix?: string;
};

export type RepushHandymanRequestNotifyResult = {
  requestId: string;
  matchedHandymen: number;
  inAppCreated: number;
  pushAttempted: number;
  pushSent: number;
  pushFailed: number;
  handymen: Array<{ id: string; name: string; hasPush: boolean }>;
};

export async function repushHandymanRequestNotify(
  prisma: PrismaClient,
  opts: RepushHandymanRequestNotifyOptions
): Promise<RepushHandymanRequestNotifyResult> {
  const {
    requestId,
    onlyWithPush = false,
    pushOnly = false,
    cityFilter,
    reminderSuffix = "reminder-push2-20260529",
  } = opts;

  const request = await prisma.request.findFirst({
    where: { id: requestId, deletedAt: null },
    select: { id: true, title: true, category: true, city: true, adminStatus: true },
  });
  if (!request) {
    throw new Error("Zahtjev nije pronađen");
  }

  const dbNames = dbCategoryNamesForDistributionFilter(request.category);
  const allHandymen = await prisma.user.findMany({
    where: prismaWhereUserActiveHandymanWithProfileExtra({
      workerCategories: { some: { category: { name: { in: dbNames } } } },
    }),
    select: {
      id: true,
      name: true,
      city: true,
      pushSubscriptions: { select: { id: true } },
      handymanProfile: { select: { cities: true } },
    },
    orderBy: { name: "asc" },
  });

  let handymen = allHandymen;
  if (cityFilter?.trim()) {
    handymen = handymen.filter((u) =>
      handymanWorksInCity(u.city, u.handymanProfile?.cities, cityFilter.trim())
    );
  }
  if (onlyWithPush) {
    handymen = handymen.filter((u) => u.pushSubscriptions.length > 0);
  }

  const variant = handymanNotifyVariantForRequest(request.id);
  const categoryLabel = displayLabelForRequestCategory(request.category);
  const { title, body } = buildHandymanNewRequestNotifyMessages(variant, categoryLabel);
  const link = `/request/${request.id}`;
  const pushBodyShort = body.replace(/\s+/g, " ").trim().slice(0, 220);

  let inAppCreated = 0;
  if (!pushOnly) {
    await createNotificationsBulk(
      handymen.map((h) => ({
        userId: h.id,
        type: "NEW_JOB" as const,
        title,
        body: body.slice(0, 200),
        link,
        idempotencyKey: `new-job-${reminderSuffix}:${request.id}:${h.id}`,
      }))
    );
    inAppCreated = handymen.length;
  }

  const pushResults = await Promise.allSettled(
    handymen.map((h) =>
      sendPushToUser(
        prisma,
        h.id,
        {
          title,
          body: pushBodyShort,
          link,
          tag: `new-job-${reminderSuffix}-${request.id}`,
        },
        { requestId: request.id }
      )
    )
  );

  const pushSent = pushResults.filter(
    (r) => r.status === "fulfilled" && (r.value ?? 0) > 0
  ).length;
  const pushFailed = pushResults.filter((r) => r.status === "rejected").length;

  return {
    requestId: request.id,
    matchedHandymen: handymen.length,
    inAppCreated,
    pushAttempted: handymen.length,
    pushSent,
    pushFailed,
    handymen: handymen.map((h) => ({
      id: h.id,
      name: h.name,
      hasPush: h.pushSubscriptions.length > 0,
    })),
  };
}
