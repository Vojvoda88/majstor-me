/**
 * Postavi bcrypt lozinku i role=ADMIN za email (isti lookup kao authorize(): case-insensitive).
 * Ako korisnik postoji kao HANDYMAN/USER, i dalje ga pronalazi i podiže na ADMIN.
 *
 * SIGURNOSNO: pokreće se SAMO ako je ALLOW_ADMIN_PASSWORD_RESET=1 u env-u.
 * Kreiranje novog reda ako email ne postoji: dodatno ALLOW_ADMIN_USER_CREATE=1.
 *
 * Produkcija (Vercel DB string u .env privremeno):
 *   ALLOW_ADMIN_PASSWORD_RESET=1 npx tsx scripts/reset-admin-password.ts jm@domen.me "NovaJakaLozinka123"
 *
 * Novi nalog (samo ako red ne postoji):
 *   ALLOW_ADMIN_PASSWORD_RESET=1 ALLOW_ADMIN_USER_CREATE=1 npx tsx scripts/reset-admin-password.ts jm@domen.me "..."
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
    console.error(
      'Usage: ALLOW_ADMIN_PASSWORD_RESET=1 npx tsx scripts/reset-admin-password.ts <email> "<password min 8>"'
    );
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, email: true, role: true, name: true },
  });

  const passwordHash = await hash(newPassword, 12);

  if (!user) {
    if (process.env.ALLOW_ADMIN_USER_CREATE !== "1") {
      console.error(
        "Nema korisnika sa tim emailom. Za kreiranje novog ADMIN naloga dodaj ALLOW_ADMIN_USER_CREATE=1 (uz ALLOW_ADMIN_PASSWORD_RESET=1)."
      );
      process.exit(1);
    }

    const name = process.env.ADMIN_DEFAULT_NAME?.trim() || "Admin";
    const created = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "ADMIN",
      },
    });
    await prisma.adminProfile.upsert({
      where: { userId: created.id },
      update: { adminRole: "SUPER_ADMIN" },
      create: { userId: created.id, adminRole: "SUPER_ADMIN" },
    });
    console.log(
      JSON.stringify(
        { ok: true, created: true, email: created.email, userId: created.id },
        null,
        2
      )
    );
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, role: "ADMIN" },
  });
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: { adminRole: "SUPER_ADMIN" },
    create: { userId: user.id, adminRole: "SUPER_ADMIN" },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        created: false,
        email: user.email,
        userId: user.id,
        previousRole: user.role,
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
