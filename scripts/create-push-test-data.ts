import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { notifyAdminsNewPendingRequest } from "@/lib/admin-signals";
import {
  productionReplayConfigured,
  replayAdminRequestNotifyOnProduction,
  type ReplayResult,
} from "./replay-production-admin-notify";

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const email = `hitni.majstor.${ts}@test.me`;
  const plainPass = "Majstor123!";
  const requesterEmail = `test.korisnik.${ts}@local.invalid`;

  const passwordHash = await bcrypt.hash(plainPass, 10);

  const handyman = await prisma.user.create({
    data: {
      role: "HANDYMAN",
      name: "Hitni Test Majstor",
      email,
      passwordHash,
      phone: "+38267111222",
      city: "Podgorica",
      handymanProfile: {
        create: {
          bio: "Test profil za push provjeru",
          cities: ["Podgorica"],
          workerStatus: "ACTIVE",
          verifiedStatus: "VERIFIED",
          creditsBalance: 500,
        },
      },
    },
    select: {
      id: true,
      email: true,
      handymanProfile: {
        select: {
          id: true,
          workerStatus: true,
          verifiedStatus: true,
        },
      },
    },
  });

  const request = await prisma.request.create({
    data: {
      category: "Vodoinstalater",
      title: "Hitno curenje ispod sudopere",
      description: "Test zahtjev za provjeru notifikacija. Voda curi ispod sudopere i treba brz dolazak.",
      city: "Podgorica",
      urgency: "HITNO_DANAS",
      status: "OPEN",
      adminStatus: "PENDING_REVIEW",
      requesterName: "Test Korisnik",
      requesterPhone: "+38269000111",
      requesterEmail,
    },
    select: {
      id: true,
      title: true,
      category: true,
      city: true,
      urgency: true,
      status: true,
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

  let productionReplay: ReplayResult | { skipped: string } | null = null;
  if (productionReplayConfigured()) {
    productionReplay = await replayAdminRequestNotifyOnProduction(request.id);
    if (!productionReplay.ok) {
      console.warn("[create-push-test-data] production replay failed", productionReplay);
    }
  } else {
    productionReplay = { skipped: "PRODUCTION_URL + CRON_SECRET u .env za push sa Vercela" };
  }

  console.log(
    JSON.stringify(
      {
        handyman: {
          id: handyman.id,
          email: handyman.email,
          password: plainPass,
          profile: handyman.handymanProfile,
        },
        request,
        productionReplay,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("[create-push-test-data] failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
