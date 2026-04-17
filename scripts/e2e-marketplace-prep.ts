/**
 * Postavlja kredit majstoru pre E2E marketplace toka (CREDITS_REQUIRED=true).
 * Pokretanje: npx tsx scripts/e2e-marketplace-prep.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.env.E2E_HANDYMAN_EMAIL ?? "majstor.vodoinstalater@test.me";
const credits = Number(process.env.E2E_HANDYMAN_START_CREDITS ?? 500);

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    throw new Error(`Handyman user not found: ${email}`);
  }
  await prisma.handymanProfile.update({
    where: { userId: user.id },
    data: { creditsBalance: credits },
  });
  console.log(`[e2e-marketplace-prep] ${email} creditsBalance=${credits}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
