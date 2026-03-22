/**
 * POSTAVI novu lozinku za postojeći ADMIN nalog (bcrypt hash u bazi).
 * SIGURNOSNO: pokreće se SAMO ako je ALLOW_ADMIN_PASSWORD_RESET=1 u env-u.
 *
 *   ALLOW_ADMIN_PASSWORD_RESET=1 npx tsx scripts/reset-admin-password.ts admin@domen.me "NovaJakaLozinka123"
 *
 * Koristi produkcijski DATABASE_URL (npr. iz Vercel) ako resetuješ live.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_ADMIN_PASSWORD_RESET !== "1") {
    console.error(
      "Odbijeno: postavi ALLOW_ADMIN_PASSWORD_RESET=1 (namjerno) da bi se resetovalo."
    );
    process.exit(1);
  }

  const emailArg = process.argv[2];
  const newPassword = process.argv[3];
  if (!emailArg || !newPassword || newPassword.length < 8) {
    console.error('Usage: ALLOW_ADMIN_PASSWORD_RESET=1 npx tsx scripts/reset-admin-password.ts <email> "<password min 8>"');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" }, role: "ADMIN" },
  });

  if (!user) {
    console.error("Nema ADMIN korisnika sa tim emailom.");
    process.exit(1);
  }

  const passwordHash = await hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log(JSON.stringify({ ok: true, email: user.email, userId: user.id }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
