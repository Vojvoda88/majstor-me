/** Stripe test: verified HANDYMAN. node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/ensure-manual-verified-user.ts */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const EMAIL = "t@test.me";
const PASSWORD = "t12345";

void (async () => {
  const prisma = new PrismaClient();
  const passwordHash = await hash(PASSWORD, 10);
  const u = await prisma.user.upsert({
    where: { email: EMAIL },
    create: {
      email: EMAIL,
      name: "Test majstor",
      passwordHash,
      role: "HANDYMAN",
      emailVerified: new Date(),
    },
    update: {
      passwordHash,
      emailVerified: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
      role: "HANDYMAN",
    },
    select: { id: true },
  });
  await prisma.handymanProfile.upsert({
    where: { userId: u.id },
    create: {
      userId: u.id,
      cities: ["Podgorica"],
      workerStatus: "ACTIVE",
    },
    update: { workerStatus: "ACTIVE" },
  });
  console.log("HANDYMAN", EMAIL, PASSWORD, "→ /dashboard/handyman/credits");
  await prisma.$disconnect();
})();
