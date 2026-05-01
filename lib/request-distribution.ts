/**
 * Distribucija zahtjeva majstorima.
 * Pokreće se SAMO kada request.adminStatus = DISTRIBUTED.
 * Filtrira samo majstore sa workerStatus = ACTIVE (ne PENDING_REVIEW, SUSPENDED, BANNED).
 */

import type { PrismaClient } from "@prisma/client";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/constants";
import { dbCategoryNamesForDistributionFilter, displayLabelForRequestCategory } from "@/lib/categories";
import {
  buildHandymanNewRequestNotifyMessages,
  handymanNotifyVariantForRequest,
  type HandymanNewRequestNotifyVariant,
} from "@/lib/handyman-request-notify-copy";
import { sendNewRequestEmail } from "@/lib/email";
import { createNotificationsBulk } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { rankHandymenForRequest } from "@/lib/smart-distribution";
import type { HandymanForDistribution } from "@/lib/smart-distribution";
import { SMART_DISTRIBUTION_CONFIG } from "@/lib/smart-distribution";
import { prismaWhereUserActiveHandymanWithProfileExtra } from "@/lib/handyman-truth";

export type DistributeRequestParams = {
  prisma: PrismaClient;
  requestId: string;
  category: string;
  city: string;
};

export type DistributeResult = {
  handymenNotified: number;
  durationMs: number;
  notifyCopyVariant: HandymanNewRequestNotifyVariant;
};

export async function distributeRequestToHandymen(params: DistributeRequestParams): Promise<DistributeResult> {
  const start = Date.now();
  const { prisma, requestId, category, city } = params;
  const categoryLabel = displayLabelForRequestCategory(category);
  const notifyVariant = handymanNotifyVariantForRequest(requestId);
  const { title: pushTitle, body: pushBody } = buildHandymanNewRequestNotifyMessages(
    notifyVariant,
    categoryLabel
  );

  /** Kad korisnik nije našao tačnu uslugu — obavještavamo majstore sa bilo kojom „pravom“ kategorijom (ne ovaj fallback). */
  const isFallbackCategory = category === REQUEST_CATEGORY_FALLBACK;
  const dbNamesForCategory = dbCategoryNamesForDistributionFilter(category);

  const allHandymen = await prisma.user.findMany({
    where: prismaWhereUserActiveHandymanWithProfileExtra({
      workerCategories: {
        some: isFallbackCategory
          ? { category: { name: { not: REQUEST_CATEGORY_FALLBACK } } }
          : { category: { name: { in: dbNamesForCategory } } },
      },
    }),
    select: {
      id: true,
      city: true,
      handymanProfile: {
        select: {
          ratingAvg: true,
          reviewCount: true,
          verifiedStatus: true,
          averageResponseMinutes: true,
          completedJobsCount: true,
          availabilityStatus: true,
          isPromoted: true,
        },
      },
    },
  });

  const withProfile = allHandymen.filter((u) => u.handymanProfile) as {
    id: string;
    city: string | null;
    handymanProfile: NonNullable<(typeof allHandymen)[0]["handymanProfile"]>;
  }[];

  const forDist: HandymanForDistribution[] = withProfile.map((u) => ({
    id: u.id,
    city: u.city,
    handymanProfile: u.handymanProfile!,
    isPromoted: u.handymanProfile?.isPromoted ?? false,
  }));

  const { topForNotify } = SMART_DISTRIBUTION_CONFIG.ENABLED
    ? rankHandymenForRequest(forDist, city)
    : { topForNotify: forDist };

  const toNotify = SMART_DISTRIBUTION_CONFIG.ENABLED
    ? topForNotify.slice(0, SMART_DISTRIBUTION_CONFIG.TOP_N_NOTIFY)
    : forDist;

  console.info("[distribution] toNotify batch", {
    requestId,
    notifyCopyVariant: notifyVariant,
    count: toNotify.length,
    userIds: toNotify.map((h) => h.id),
    rankedPool: forDist.length,
    category,
    city,
  });

  if (toNotify.length === 0) {
    console.warn("[distribution] toNotify empty — no ACTIVE handyman matched category/city filters", {
      requestId,
      category,
      city,
      rankedPool: forDist.length,
    });
  }

  const notifyMsg = pushTitle;
  const bodyTrim = pushBody.slice(0, 200);
  const link = `/request/${requestId}`;

  await createNotificationsBulk(
    toNotify.map((h) => ({
      userId: h.id,
      type: "NEW_JOB" as const,
      title: notifyMsg,
      body: bodyTrim,
      link,
      idempotencyKey: `new-job:${requestId}:${h.id}`,
    }))
  );
  console.info("[distribution] NEW_JOB notifications insert attempted", {
    requestId,
    count: toNotify.length,
  });

  await Promise.allSettled(
    toNotify.map((h) => sendNewRequestEmail(h.id, requestId, notifyVariant, categoryLabel, city))
  );
  const pushBodyShort = pushBody.replace(/\s+/g, " ").trim().slice(0, 220);

  await Promise.allSettled(
    toNotify.map((h) =>
      sendPushToUser(prisma, h.id, {
        title: pushTitle,
        body: pushBodyShort,
        link,
        tag: "new-job-" + requestId,
      }, { requestId })
    )
  );

  const durationMs = Date.now() - start;
  return { handymenNotified: toNotify.length, durationMs, notifyCopyVariant: notifyVariant };
}
