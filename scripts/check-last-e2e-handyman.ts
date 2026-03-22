import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst({
    where: { email: { contains: "e2e_majstor_" } },
    orderBy: { createdAt: "desc" },
  });
  if (!u) {
    console.log("no e2e_majstor user");
    return;
  }
  const hp = await prisma.handymanProfile.findUnique({ where: { userId: u.id } });
  const tx = await prisma.creditTransaction.findMany({ where: { handymanId: u.id } });
  console.log(
    JSON.stringify(
      {
        email: u.email,
        creditsBalance: hp?.creditsBalance,
        starterBonusGrantedAt: hp?.starterBonusGrantedAt,
        creditTxCount: tx.length,
        firstTx: tx[0]?.type,
      },
      null,
      2
    )
  );
}

main()
  .finally(() => prisma.$disconnect());
