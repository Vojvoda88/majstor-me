/**
 * Ispis svih korisnika sa role=ADMIN u bazi iz DATABASE_URL.
 * Ne loguje hash. Za live: postavi DATABASE_URL iz Vercel (ili .env produkcija).
 *
 *   npx tsx scripts/list-admin-users.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL (maskirano):", maskUrl(process.env.DATABASE_URL));

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = admins.map((u) => ({
    email: u.email,
    name: u.name,
    hasPasswordHash: !!(u.passwordHash && u.passwordHash.length >= 10),
    hashPrefix: u.passwordHash?.startsWith("$2") ? "bcrypt" : u.passwordHash ? "unknown" : "empty",
    userId: u.id,
  }));

  console.log(JSON.stringify({ adminCount: admins.length, admins: rows }, null, 2));

  const ap = await prisma.adminProfile.findMany({
    select: { userId: true, adminRole: true },
  });
  console.log(
    JSON.stringify(
      {
        adminProfiles: ap.length,
        links: ap.map((p) => ({ userId: p.userId, adminRole: p.adminRole })),
      },
      null,
      2
    )
  );
}

function maskUrl(url: string | undefined): string {
  if (!url) return "(nema DATABASE_URL)";
  try {
    const u = new URL(url);
    u.password = u.password ? "***" : "";
    return u.toString();
  } catch {
    return "(nevalidan URL)";
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
