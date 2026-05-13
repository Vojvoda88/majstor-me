/**
 * Distribucija zahtjeva majstorima.
 * Pokreće se SAMO kada request.adminStatus = DISTRIBUTED (ili kasniji otvoreni lead statusi).
 * Filtrira samo majstore sa workerStatus = ACTIVE (ne PENDING_REVIEW, SUSPENDED, BANNED).
 *
 * Glavna kategorija: `distributeRequestToHandymen` (request.category).
 * Dodatne kategorije (samo kad admin doda): `distributeRequestToHandymenForExtraCategories` — ne mijenja `request.category`,
 * samo šalje još jedan talas notifikacija majstorima u tim kategorijama (isti idempotency ključ — bez duplikata).
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

/** Union DB imena kategorija za Prisma `in` filter (više internal oznaka odjednom). */
export function unionDbCategoryNamesForDistribution(internalCategories: string[]): string[] {
  const set = new Set<string>();
  for (const c of internalCategories) {
    for (const n of dbCategoryNamesForDistributionFilter(c)) {
      set.add(n);
    }
  }
  return Array.from(set);
}

type DistributionFilter =
  | { kind: "primary"; category: string }
  | { kind: "explicit_in"; dbNames: string[] };

async function runDistributionWave(params: {
  prisma: PrismaClient;
  requestId: string;
  city: string;
  /** Tekst u emailu / pushu (npr. label glavne ili „Sitni kućni poslovi + …“) */
  categoryLabelForMessaging: string;
  filter: DistributionFilter;
  logExtra?: Record<string, unknown>;
}): Promise<DistributeResult> {
  const start = Date.now();
  const { prisma, requestId, city, categoryLabelForMessaging, filter, logExtra } = params;
  const notifyVariant = handymanNotifyVariantForRequest(requestId);
  const { title: pushTitle, body: pushBody } = buildHandymanNewRequestNotifyMessages(
    notifyVariant,
    categoryLabelForMessaging
  );

  let workerCategoriesFilter: { some: { category: { name: { in?: string[]; not?: string } } } };
  if (filter.kind === "primary") {
    const category = filter.category;
    const isFallbackCategory = category === REQUEST_CATEGORY_FALLBACK;
    const dbNamesForCategory = dbCategoryNamesForDistributionFilter(category);
    workerCategoriesFilter = {
      some: isFallbackCategory
        ? { category: { name: { not: REQUEST_CATEGORY_FALLBACK } } }
        : { category: { name: { in: dbNamesForCategory } } },
    };
  } else {
    if (filter.dbNames.length === 0) {
      return { handymenNotified: 0, durationMs: Date.now() - start, notifyCopyVariant: notifyVariant };
    }
    workerCategoriesFilter = {
      some: { category: { name: { in: filter.dbNames } } },
    };
  }

  const allHandymen = await prisma.user.findMany({
    where: prismaWhereUserActiveHandymanWithProfileExtra({
      workerCategories: workerCategoriesFilter,
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
    filterKind: filter.kind,
    ...logExtra,
    city,
  });

  if (toNotify.length === 0) {
    console.warn("[distribution] toNotify empty — no ACTIVE handyman matched category filters", {
      requestId,
      city,
      rankedPool: forDist.length,
      ...logExtra,
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
    ...logExtra,
  });

  await Promise.allSettled(
    toNotify.map((h) =>
      sendNewRequestEmail(h.id, requestId, notifyVariant, categoryLabelForMessaging, city)
    )
  );
  const pushBodyShort = pushBody.replace(/\s+/g, " ").trim().slice(0, 220);

  await Promise.allSettled(
    toNotify.map((h) =>
      sendPushToUser(
        prisma,
        h.id,
        {
          title: pushTitle,
          body: pushBodyShort,
          link,
          tag: "new-job-" + requestId,
        },
        { requestId }
      )
    )
  );

  const durationMs = Date.now() - start;
  return { handymenNotified: toNotify.length, durationMs, notifyCopyVariant: notifyVariant };
}

export async function distributeRequestToHandymen(params: DistributeRequestParams): Promise<DistributeResult> {
  const { prisma, requestId, category, city } = params;
  const categoryLabel = displayLabelForRequestCategory(category);
  return runDistributionWave({
    prisma,
    requestId,
    city,
    categoryLabelForMessaging: categoryLabel,
    filter: { kind: "primary", category },
    logExtra: { category },
  });
}

/**
 * Talas distribucije za jednu ili više **dodatnih** internal kategorija (admin).
 * Ne dira `request.category`. Isti idempotency ključ kao glavna distribucija — majstori koji su već dobili NEW_JOB za ovaj zahtjev ne dobijaju duplikat.
 */
export async function distributeRequestToHandymenForExtraCategories(params: {
  prisma: PrismaClient;
  requestId: string;
  city: string;
  /** Internal nazivi kategorija (npr. "Sitni kućni poslovi") — samo za ovaj talas */
  extraInternalCategories: string[];
}): Promise<DistributeResult> {
  const { prisma, requestId, city, extraInternalCategories } = params;
  const unique = Array.from(
    new Set(extraInternalCategories.map((c) => c.trim()).filter(Boolean))
  );
  if (unique.length === 0) {
    const notifyVariant = handymanNotifyVariantForRequest(requestId);
    return { handymenNotified: 0, durationMs: 0, notifyCopyVariant: notifyVariant };
  }
  const dbNames = unionDbCategoryNamesForDistribution(unique);
  const label =
    unique.length === 1
      ? displayLabelForRequestCategory(unique[0]!)
      : unique.map((c) => displayLabelForRequestCategory(c)).join(" · ");
  return runDistributionWave({
    prisma,
    requestId,
    city,
    categoryLabelForMessaging: label,
    filter: { kind: "explicit_in", dbNames },
    logExtra: { extraDistributionCategories: unique },
  });
}
