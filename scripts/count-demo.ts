import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const demoEmails = { endsWith: "@local.majstor.demo" };
  const h = await prisma.user.count({
    where: { email: demoEmails, role: "HANDYMAN" },
  });
  const u = await prisma.user.count({
    where: { email: demoEmails, role: "USER" },
  });
  const r = await prisma.request.count({
    where: {
      OR: [
        { user: { email: demoEmails } },
        {
          userId: null,
          requesterEmail: { startsWith: "gost.", endsWith: "@local.invalid" },
        },
      ],
    },
  });
  const totalReq = await prisma.request.count();
  console.log(JSON.stringify({ demoHandymen: h, demoUsers: u, demoRequests: r, totalRequests: totalReq }));
}
main().finally(() => prisma.$disconnect());
