/**
 * Postavi bcrypt lozinku i role=ADMIN za email (isti lookup kao authorize(): case-insensitive).
 * Ako korisnik postoji kao HANDYMAN/USER, i dalje ga pronalazi i podiže na ADMIN.
 *
 * SIGURNOSNO: pokreće se SAMO ako je ALLOW_ADMIN_PASSWORD_RESET=1 u env-u.
 * Kreiranje novog reda ako email ne postoji: dodatno ALLOW_ADMIN_USER_CREATE=1.
 *
 * VAŽNO:
 * - Ova skripta po defaultu dodjeljuje OPERATIONS_ADMIN.
 * - SUPER_ADMIN je blokiran osim ako je ALLOW_SUPER_ADMIN_ASSIGN=1.
 *
 * Produkcija (Vercel DB string u .env privremeno):
 *   ALLOW_ADMIN_PASSWORD_RESET=1 npx tsx scripts/reset-admin-password.ts jm@domen.me "NovaJakaLozinka123"
 *
 * Novi nalog (samo ako red ne postoji):
 *   ALLOW_ADMIN_PASSWORD_RESET=1 ALLOW_ADMIN_USER_CREATE=1 npx tsx scripts/reset-admin-password.ts jm@domen.me "..."
 */
import { AdminRole, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const ADMIN_ROLES = Object.values(AdminRole);

function parseAdminRole(raw: string): AdminRole {
  if (!ADMIN_ROLES.includes(raw as AdminRole)) {
    throw new Error(`Neispravna ADMIN_ASSIGN_ROLE vrijednost: ${raw}. Dozvoljeno: ${ADMIN_ROLES.join(", ")}`);
  }
  return raw as AdminRole;
}

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
  const adminRoleRaw = (process.env.ADMIN_ASSIGN_ROLE ?? "OPERATIONS_ADMIN")
    .trim()
    .toUpperCase();
  const adminRoleArg = parseAdminRole(adminRoleRaw);

  if (adminRoleArg === "SUPER_ADMIN" && process.env.ALLOW_SUPER_ADMIN_ASSIGN !== "1") {
    console.error("SUPER_ADMIN nije dozvoljen kroz ovu skriptu. Dodaj ALLOW_SUPER_ADMIN_ASSIGN=1 samo ako baš mora.");
    process.exit(1);
  }
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
      update: { adminRole: adminRoleArg },
      create: { userId: created.id, adminRole: adminRoleArg },
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
    update: { adminRole: adminRoleArg },
    create: { userId: user.id, adminRole: adminRoleArg },
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
