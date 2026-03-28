import type { PrismaClient } from "@prisma/client";
import { REQUEST_CATEGORY_FALLBACK } from "@/lib/constants";
import { createNotificationsBulk } from "@/lib/notifications";
import { sendPushToUser } from "@/lib/push";
import { getInternalCategory, workerHasCategoryForRequest } from "@/lib/categories";

const BACKLOG_APPROVED_STATUSES: Array<"DISTRIBUTED" | "HAS_OFFERS" | "CONTACT_UNLOCKED"> = [
  "DISTRIBUTED",
  "HAS_OFFERS",
  "CONTACT_UNLOCKED",
];

type ReplayResult = {
  scannedRequests: number;
  createdInApp: number;
  pushSubscriptions: number;
  pushSent: number;
};

export async function replayBacklogNotificationsForActiveHandyman(
  prisma: PrismaClient,
  handymanUserId: string
): Promise<ReplayResult> {
  const profile = await prisma.handymanProfile.findUnique({
    where: { userId: handymanUserId },
    select: {
      userId: true,
      workerStatus: true,
      workerCategories: {
        select: {
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!profile || profile.workerStatus !== "ACTIVE") {
    return { scannedRequests: 0, createdInApp: 0, pushSubscriptions: 0, pushSent: 0 };
  }

  const workerCategoryNamesRaw = profile.workerCategories
    .map((wc) => wc.category?.name)
    .filter((v): v is string => Boolean(v?.trim()));
  const workerCategoryNames = workerCategoryNamesRaw
    .map((name) => getInternalCategory(name) ?? name)
    .filter((v): v is string => Boolean(v?.trim()));

  const requestsRaw = await prisma.request.findMany({
    where: {
      status: "OPEN",
      deletedAt: null,
      adminStatus: { in: BACKLOG_APPROVED_STATUSES },
    },
    select: {
      id: true,
      category: true,
      city: true,
      title: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const requests =
    workerCategoryNames.length > 0
      ? requestsRaw.filter((r) => {
          if (r.category === REQUEST_CATEGORY_FALLBACK) return true;
          const requestCategory = getInternalCategory(r.category) ?? r.category;
          return workerHasCategoryForRequest(workerCategoryNames, requestCategory);
        })
      : requestsRaw;

  if (requests.length === 0) {
    return { scannedRequests: 0, createdInApp: 0, pushSubscriptions: 0, pushSent: 0 };
  }

  const links = requests.map((r) => `/request/${r.id}`);
  const existing = await prisma.notification.findMany({
    where: {
      userId: handymanUserId,
      type: "NEW_JOB",
      link: { in: links },
    },
    select: { link: true },
  });
  const existingLinkSet = new Set(existing.map((n) => n.link).filter((v): v is string => Boolean(v)));
  const missing = requests.filter((r) => !existingLinkSet.has(`/request/${r.id}`));

  if (missing.length === 0) {
    const subCount = await prisma.pushSubscription.count({ where: { userId: handymanUserId } });
    return {
      scannedRequests: requests.length,
      createdInApp: 0,
      pushSubscriptions: subCount,
      pushSent: 0,
    };
  }

  await createNotificationsBulk(
    missing.map((r) => ({
      userId: handymanUserId,
      type: "NEW_JOB" as const,
      title: `Otvoren posao za ${r.category} u ${r.city}`,
      body: (r.title?.trim() || r.description?.trim() || "Otvorite zahtjev i pošaljite ponudu.").slice(0, 180),
      link: `/request/${r.id}`,
      idempotencyKey: `backlog-new-job:${r.id}:${handymanUserId}`,
    }))
  );

  const pushSubscriptionCount = await prisma.pushSubscription.count({
    where: { userId: handymanUserId },
  });

  let pushSent = 0;
  if (pushSubscriptionCount > 0) {
    const pushResults = await Promise.all(
      missing.map((r) =>
        sendPushToUser(
          prisma,
          handymanUserId,
          {
            title: `Otvoren posao za ${r.category} u ${r.city}`,
            body: (r.title?.trim() || r.description?.trim() || "Otvorite zahtjev i pošaljite ponudu.").slice(0, 180),
            link: `/request/${r.id}`,
            tag: `backlog-job-${r.id}`,
          },
          { requestId: r.id }
        )
      )
    );
    pushSent = pushResults.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
  }

  return {
    scannedRequests: requests.length,
    createdInApp: missing.length,
    pushSubscriptions: pushSubscriptionCount,
    pushSent,
  };
}
