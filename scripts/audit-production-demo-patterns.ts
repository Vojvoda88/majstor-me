/**
 * READ-ONLY: broji obrasce koji u kodu označavaju demo/test podatke.
 * Ne briše ništa. Pokreni uz produkcijski DATABASE_URL samo za pregled prije čišćenja.
 *
 *   npx tsx scripts/audit-production-demo-patterns.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const localDemoSuffix = "@local.majstor.demo";
  const testMeSuffix = "@test.me";

  const [demoUsersLocal, demoHandymenLocal, demoUsersTestMe, demoHandymenTestMe] =
    await Promise.all([
      prisma.user.count({ where: { email: { endsWith: localDemoSuffix }, role: "USER" } }),
      prisma.user.count({ where: { email: { endsWith: localDemoSuffix }, role: "HANDYMAN" } }),
      prisma.user.count({ where: { email: { endsWith: testMeSuffix }, role: "USER" } }),
      prisma.user.count({ where: { email: { endsWith: testMeSuffix }, role: "HANDYMAN" } }),
    ]);

  const guestDemoRequests = await prisma.request.count({
    where: {
      userId: null,
      requesterEmail: { startsWith: "gost.", endsWith: "@local.invalid" },
    },
  });

  const e2eTitleRequests = await prisma.request.count({
    where: { title: { contains: "E2E test", mode: "insensitive" } },
  });

  const creditTxTestMe = await prisma.creditTransaction.count({
    where: { handyman: { email: { endsWith: testMeSuffix } } },
  });
  const creditTxLocalDemo = await prisma.creditTransaction.count({
    where: { handyman: { email: { endsWith: localDemoSuffix } } },
  });

  const cashTestMe = await prisma.creditCashActivationRequest.count({
    where: { user: { email: { endsWith: testMeSuffix } } },
  });
  const cashLocalDemo = await prisma.creditCashActivationRequest.count({
    where: { user: { email: { endsWith: localDemoSuffix } } },
  });

  const offersTestMe = await prisma.offer.count({
    where: { handyman: { email: { endsWith: testMeSuffix } } },
  });
  const offersLocalDemo = await prisma.offer.count({
    where: { handyman: { email: { endsWith: localDemoSuffix } } },
  });

  const adminEmails = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });

  console.log(
    JSON.stringify(
      {
        note: "READ-ONLY audit — nije izvršeno brisanje",
        users_local_majstor_demo: { USER: demoUsersLocal, HANDYMAN: demoHandymenLocal },
        users_test_me: { USER: demoUsersTestMe, HANDYMAN: demoHandymenTestMe },
        requests_guest_gost_local_invalid: guestDemoRequests,
        requests_title_contains_e2e_test: e2eTitleRequests,
        credit_transactions_handyman: { test_me: creditTxTestMe, local_majstor_demo: creditTxLocalDemo },
        cash_activation_requests: { test_me: cashTestMe, local_majstor_demo: cashLocalDemo },
        offers_by_handyman_email: { test_me: offersTestMe, local_majstor_demo: offersLocalDemo },
        admin_accounts_in_db_list_only: adminEmails.map((a) => a.email),
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
