/**
 * Kreira test majstora (HANDYMAN + HandymanProfile) i odmah šalje
 * admin in-app notifikacije + push da se provjeri tok na telefonu.
 *
 * Pokretanje:
 *   npx tsx scripts/create-test-handyman-profile.ts
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { sendPushToUser } from "../lib/push";

const prisma = new PrismaClient();

async function main() {
  const stamp = Date.now().toString().slice(-8);
  const email = `majstor.test.${stamp}@example.com`;
  const plainPassword = `Test123!${stamp}`;

  const passwordHash = await hash(plainPassword, 12);
  const user = await prisma.user.create({
    data: {
      name: `Test Majstor ${stamp}`,
      email,
      role: "HANDYMAN",
      passwordHash,
      city: "Podgorica",
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await prisma.handymanProfile.create({
    data: {
      userId: user.id,
      bio: "Test profil za provjeru admin notifikacija.",
      cities: ["Podgorica"],
      workerStatus: "PENDING_REVIEW",
      verifiedStatus: "PENDING",
    },
  });

  const adminRows = await prisma.user.findMany({
    where: {
      OR: [{ role: "ADMIN" }, { adminProfile: { isNot: null } }],
    },
    select: { id: true },
  });
  const adminIds = Array.from(new Set(adminRows.map((r) => r.id)));

  const title = "Nova prijava majstora čeka pregled";
  const body = user.name ?? "Majstor";
  const link = `/admin/handymen/${user.id}`;

  for (const adminId of adminIds) {
    const exists = await prisma.notification.findFirst({
      where: { userId: adminId, type: "ADMIN_PENDING_HANDYMAN", link },
      select: { id: true },
    });
    if (!exists) {
      await prisma.notification.create({
        data: {
          userId: adminId,
          type: "ADMIN_PENDING_HANDYMAN",
          title,
          body,
          link,
        },
      });
    }

    await sendPushToUser(
      prisma,
      adminId,
      { title, body, link, tag: `admin-hm-${user.id}` },
      { requestId: `manual-test-${stamp}` }
    );
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        createdHandyman: user,
        passwordForLoginTest: plainPassword,
        adminRecipients: adminIds.length,
        adminLink: link,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
