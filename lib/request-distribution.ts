/**
 * Distribucija zahtjeva majstorima.
 * Pokreće se SAMO kada request.adminStatus = DISTRIBUTED.
 * Filtrira samo majstore sa workerStatus = ACTIVE (ne PENDING_REVIEW, SUSPENDED, BANNED).
 */

import type { PrismaClient, UrgencyLevel } from "@prisma/client";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/constants";
import { dbCategoryNamesForDistributionFilter, displayLabelForRequestCategory } from "@/lib/categories";
import { sendNewRequestEmail } from "@/lib/email";
import { createNotificationsBulk } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { rankHandymenForRequest } from "@/lib/smart-distribution";
import type { HandymanForDistribution } from "@/lib/smart-distribution";
import { SMART_DISTRIBUTION_CONFIG } from "@/lib/smart-distribution";

export type DistributeRequestParams = {
  prisma: PrismaClient;
  requestId: string;
  category: string;
  city: string;
  title?: string | null;
  description: string;
  /** Za naslov push-a (hitno / uskoro). */
  urgency?: UrgencyLevel;
};

export type DistributeResult = { handymenNotified: number; durationMs: number };

function buildNewRequestNotificationTitle(
  urgency: UrgencyLevel | undefined,
  categoryLabel: string,
  city: string
): string {
  const place = (city ?? "").trim() || "Crna Gora";
  const cat = categoryLabel.trim();
  if (urgency === "HITNO_DANAS") {
    return `Novi hitan zahtjev za ${cat} u ${place}`;
  }
  if (urgency === "U_NAREDNA_2_DANA") {
    return `Novi zahtjev (uskoro) za ${cat} u ${place}`;
  }
  return `Novi zahtjev za ${cat} u ${place}`;
}

function buildNewRequestNotificationBody(title: string | null | undefined, description: string): string {
  const t = (title ?? "").trim();
  const d = (description ?? "").trim().replace(/\s+/g, " ");
  if (t.length >= 8) {
    return t.slice(0, 160);
  }
  return d.slice(0, 160) || "Otvorite zahtjev i pošaljite ponudu ako vam odgovara.";
}

export async function distributeRequestToHandymen(params: DistributeRequestParams): Promise<DistributeResult> {
  const start = Date.now();
  const { prisma, requestId, category, city, title, description, urgency } = params;
  const categoryLabel = displayLabelForRequestCategory(category);
  const pushTitle = buildNewRequestNotificationTitle(urgency, categoryLabel, city);
  const pushBody = buildNewRequestNotificationBody(title, description);

  /** Kad korisnik nije našao tačnu uslugu — obavještavamo majstore sa bilo kojom „pravom“ kategorijom (ne ovaj fallback). */
  const isFallbackCategory = category === REQUEST_CATEGORY_FALLBACK;
  const dbNamesForCategory = dbCategoryNamesForDistributionFilter(category);

  const allHandymen = await prisma.user.findMany({
    where: {
      role: "HANDYMAN",
      bannedAt: null,
      suspendedAt: null,
      handymanProfile: {
        workerStatus: "ACTIVE",
        workerCategories: {
          some: isFallbackCategory
            ? { category: { name: { not: REQUEST_CATEGORY_FALLBACK } } }
            : { category: { name: { in: dbNamesForCategory } } },
        },
      },
    },
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
    }))
  );

  await Promise.allSettled(
    toNotify.map((h) =>
      sendNewRequestEmail(h.id, requestId, category, city)
    )
  );
  const pushBodyShort = `${pushBody} Otvorite zahtjev i pošaljite ponudu.`.replace(/\s+/g, " ").trim().slice(0, 220);

  await Promise.allSettled(
    toNotify.map((h) =>
      sendPushToUser(prisma, h.id, {
        title: pushTitle,
        body: pushBodyShort,
        link,
        tag: "new-job-" + requestId,
      })
    )
  );

  const durationMs = Date.now() - start;
  return { handymenNotified: toNotify.length, durationMs };
}
