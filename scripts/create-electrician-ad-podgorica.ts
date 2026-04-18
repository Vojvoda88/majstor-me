import { PrismaClient } from "@prisma/client";
import { notifyAdminsNewPendingRequest } from "@/lib/admin-signals";
import { getPushServerConfig } from "@/lib/push";
import {
  productionReplayConfigured,
  replayAdminRequestNotifyOnProduction,
  type ReplayResult,
} from "./replay-production-admin-notify";

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const requesterEmail = `oglas.elektricar.${ts}@local.invalid`;

  const request = await prisma.request.create({
    data: {
      category: "Električar",
      title: "Tražim električara u Podgorici",
      description:
        "Potreban električar za zamjenu osigurača u ormaru i provjeru instalacije u stanu (Stari aerodrom). Molim ponudu sa rokom dolaska.",
      city: "Podgorica",
      urgency: "U_NAREDNA_2_DANA",
      status: "OPEN",
      adminStatus: "PENDING_REVIEW",
      requesterName: "Marko P.",
      requesterPhone: "+38267000111",
      requesterEmail,
    },
    select: {
      id: true,
      title: true,
      category: true,
      city: true,
      urgency: true,
      adminStatus: true,
      createdAt: true,
    },
  });

  await notifyAdminsNewPendingRequest({
    requestId: request.id,
    category: request.category,
    city: request.city,
    title: request.title,
    urgency: request.urgency,
  });

  const pushCfg = getPushServerConfig();

  let productionReplay: ReplayResult | { skipped: string } | null = null;
  if (productionReplayConfigured()) {
    productionReplay = await replayAdminRequestNotifyOnProduction(request.id);
    if (!productionReplay.ok) {
      console.warn("[create-electrician-ad-podgorica] production replay failed", productionReplay);
    }
  } else {
    productionReplay = {
      skipped:
        "Postavi PRODUCTION_URL i CRON_SECRET u .env da automatski pošalješ push sa Vercela nakon skripte.",
    };
  }

  console.log(
    JSON.stringify(
      {
        request,
        url: `/request/${request.id}`,
        adminNotify: {
          inApp: "uvijek upisano u bazu iz ove skripte",
          devicePushFromThisShell: pushCfg.canSend,
        },
        productionReplay,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("[create-electrician-ad-podgorica] failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
