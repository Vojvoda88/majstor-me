/**
 * Skida admin pristup korisniku (briše adminProfile) i spušta ga na USER (default).
 *
 * Primjer:
 *   ALLOW_ADMIN_STAFF_EDIT=1 npx tsx scripts/revoke-admin-access.ts neko@domen.me
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_ADMIN_STAFF_EDIT !== "1") {
    console.error("Odbijeno: postavi ALLOW_ADMIN_STAFF_EDIT=1 da potvrdiš skidanje admin pristupa.");
    process.exit(1);
  }

  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error(
      "Usage: ALLOW_ADMIN_STAFF_EDIT=1 npx tsx scripts/revoke-admin-access.ts <email>"
    );
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error("Korisnik nije pronađen.");
    process.exit(1);
  }

  await prisma.$transaction(async (tx) => {
    await tx.adminProfile.deleteMany({ where: { userId: user.id } });
    await tx.user.update({
      where: { id: user.id },
      data: { role: "USER" },
    });
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: user.id,
        email: user.email,
        previousRole: user.role,
        newRole: "USER",
        adminAccess: "revoked",
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
