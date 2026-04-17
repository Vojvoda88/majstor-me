/**
 * Ručno okida admin push signale za najnoviji pending request i pending/recent handyman profil.
 *
 * Pokretanje:
 *   npx tsx scripts/trigger-push-test-signal.ts
 */
import { prisma } from "@/lib/db";
import {
  notifyAdminsHandymanReturnedToReview,
  notifyAdminsNewPendingHandyman,
  notifyAdminsNewPendingRequest,
} from "@/lib/admin-signals";

async function main() {
  const request = await prisma.request.findFirst({
    where: { adminStatus: "PENDING_REVIEW" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      city: true,
      title: true,
      urgency: true,
    },
  });

  if (request) {
    await notifyAdminsNewPendingRequest({
      requestId: request.id,
      category: request.category,
      city: request.city,
      title: request.title,
      urgency: request.urgency,
    });
    console.log("[trigger-push-test-signal] pending request signal sent", request.id);
  } else {
    console.log("[trigger-push-test-signal] no pending request found");
  }

  const handyman = await prisma.user.findFirst({
    where: {
      role: "HANDYMAN",
      handymanProfile: { isNot: null },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      handymanProfile: { select: { workerStatus: true } },
    },
  });

  if (handyman) {
    const displayName = handyman.name || "Test majstor";
    if (handyman.handymanProfile?.workerStatus === "PENDING_REVIEW") {
      await notifyAdminsNewPendingHandyman({
        handymanUserId: handyman.id,
        displayName,
      });
      console.log("[trigger-push-test-signal] pending handyman signal sent", handyman.id);
    } else {
      await notifyAdminsHandymanReturnedToReview({
        handymanUserId: handyman.id,
        displayName,
      });
      console.log("[trigger-push-test-signal] re-review handyman signal sent", handyman.id);
    }
  } else {
    console.log("[trigger-push-test-signal] no handyman found");
  }
}

main()
  .catch((e) => {
    console.error("[trigger-push-test-signal] failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

