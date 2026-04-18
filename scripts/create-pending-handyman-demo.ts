import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { notifyAdminsNewPendingHandyman } from "@/lib/admin-signals";

const prisma = new PrismaClient();

async function main() {
  const ts = Date.now();
  const email = `demo.majstor.${ts}@test.me`;
  const plainPass = "Majstor123!";
  const name = "Demo majstor (čeka pregled)";
  const passwordHash = await bcrypt.hash(plainPass, 10);

  const category = await prisma.category.findFirst({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  const handyman = await prisma.user.create({
    data: {
      role: "HANDYMAN",
      name,
      email,
      passwordHash,
      phone: "+38267222333",
      city: "Podgorica",
      handymanProfile: {
        create: {
          bio: "Test registracija — čeka admin odobrenje.",
          cities: ["Podgorica"],
          workerStatus: "PENDING_REVIEW",
          verifiedStatus: "PENDING",
          creditsBalance: 0,
          ...(category
            ? {
                workerCategories: {
                  create: [{ categoryId: category.id }],
                },
              }
            : {}),
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      handymanProfile: {
        select: { id: true, workerStatus: true },
      },
    },
  });

  await notifyAdminsNewPendingHandyman({
    handymanUserId: handyman.id,
    displayName: handyman.name ?? name,
  });

  const pushCfg = await import("@/lib/push").then((m) => m.getPushServerConfig());

  console.log(
    JSON.stringify(
      {
        handyman: {
          id: handyman.id,
          email: handyman.email,
          password: plainPass,
          profile: handyman.handymanProfile,
          categoryLinked: category?.name ?? null,
        },
        adminUrl: `/admin/handymen/${handyman.id}`,
        notify: "in-app + push (ako VAPID u ovom procesu)",
        pushFromThisShell: pushCfg.canSend,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error("[create-pending-handyman-demo] failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
