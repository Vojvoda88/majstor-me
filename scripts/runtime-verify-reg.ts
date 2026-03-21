import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const userId = process.argv[2];
  const hmId = process.argv[3];
  if (!userId || !hmId) {
    console.error("Usage: npx tsx scripts/runtime-verify-reg.ts <userId> <handymanUserId>");
    process.exit(1);
  }
  const u = await p.user.findUnique({
    where: { id: userId },
    include: { handymanProfile: true },
  });
  const h = await p.user.findUnique({
    where: { id: hmId },
    include: { handymanProfile: true },
  });
  console.log(
    "USER_ROW:",
    JSON.stringify({
      email: u?.email,
      role: u?.role,
      handymanProfile: u?.handymanProfile ? null : "none",
    })
  );
  console.log(
    "HANDYMAN_ROW:",
    JSON.stringify({
      email: h?.email,
      role: h?.role,
      handymanProfileId: h?.handymanProfile?.id ?? null,
      citiesLen: h?.handymanProfile?.cities?.length ?? 0,
    })
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
