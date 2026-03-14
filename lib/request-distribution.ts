/**
 * Distribucija zahtjeva majstorima.
 * Pokreće se SAMO kada request.adminStatus = DISTRIBUTED.
 * Filtrira samo majstore sa workerStatus = ACTIVE (ne PENDING_REVIEW, SUSPENDED, BANNED).
 */

import type { PrismaClient } from "@prisma/client";
import { sendNewRequestEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
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
};

export async function distributeRequestToHandymen(params: DistributeRequestParams) {
  const { prisma, requestId, category, city, title, description } = params;
  const descTrimmed = (description ?? "").slice(0, 100);

  const allHandymen = await prisma.user.findMany({
    where: {
      role: "HANDYMAN",
      bannedAt: null,
      suspendedAt: null,
      handymanProfile: {
        workerStatus: "ACTIVE",
        workerCategories: {
          some: { category: { name: category } },
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

  const notifyMsg = `Novi zahtjev: ${category} – ${city}. Otvori aplikaciju i pošalji ponudu.`;

  for (const h of toNotify) {
    sendNewRequestEmail(h.id, requestId, category, city).catch(() => {});
  }
  for (const h of toNotify) {
    createNotification(h.id, "NEW_JOB", notifyMsg, {
      body: (title ?? descTrimmed).slice(0, 100),
      link: `/request/${requestId}`,
    }).catch(() => {});
    sendPushToUser(prisma, h.id, {
      title: "Novi zahtjev: " + category + " – " + city,
      body: "Otvori aplikaciju i pošalji ponudu.",
      link: `/request/${requestId}`,
      tag: "new-job-" + requestId,
    }).catch(() => {});
  }

  return { handymenNotified: toNotify.length };
}
