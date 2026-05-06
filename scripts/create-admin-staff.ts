/**
 * Kreira ili ažurira staff admin nalog sa OGRANIČENOM admin rolom.
 *
 * Namjerno ne dozvoljava SUPER_ADMIN (osim ako se eksplicitno dozvoli env flagom).
 *
 * Primjer:
 *   ALLOW_ADMIN_STAFF_CREATE=1 npx tsx scripts/create-admin-staff.ts neko@domen.me "Sifra123456" "Ime Prezime" OPERATIONS_ADMIN
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const STAFF_ROLES = [
  "OPERATIONS_ADMIN",
  "MODERATION_ADMIN",
  "FINANCE_ADMIN",
  "SUPPORT_ADMIN",
  "READ_ONLY",
] as const;

type StaffRole = (typeof STAFF_ROLES)[number];

function parseRole(raw: string | undefined): StaffRole | "SUPER_ADMIN" {
  const role = (raw ?? "OPERATIONS_ADMIN").trim().toUpperCase();
  if (role === "SUPER_ADMIN") return "SUPER_ADMIN";
  if ((STAFF_ROLES as readonly string[]).includes(role)) return role as StaffRole;
  throw new Error(
    `Neispravna admin rola: ${role}. Dozvoljeno: ${STAFF_ROLES.join(", ")}`
  );
}

async function main() {
  if (process.env.ALLOW_ADMIN_STAFF_CREATE !== "1") {
    console.error("Odbijeno: postavi ALLOW_ADMIN_STAFF_CREATE=1 da potvrdiš kreiranje staff admin naloga.");
    process.exit(1);
  }

  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];
  const nameArg = process.argv[4];
  const roleArg = process.argv[5];

  if (!emailArg || !passwordArg || passwordArg.length < 8) {
    console.error(
      'Usage: ALLOW_ADMIN_STAFF_CREATE=1 npx tsx scripts/create-admin-staff.ts <email> "<password min 8>" "<name optional>" <OPERATIONS_ADMIN|MODERATION_ADMIN|FINANCE_ADMIN|SUPPORT_ADMIN|READ_ONLY>'
    );
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const passwordHash = await hash(passwordArg, 12);
  const name = (nameArg?.trim() || "Admin Staff").slice(0, 120);
  const role = parseRole(roleArg);

  if (role === "SUPER_ADMIN" && process.env.ALLOW_SUPER_ADMIN_ASSIGN !== "1") {
    console.error("SUPER_ADMIN nije dozvoljen kroz ovu skriptu. (ALLOW_SUPER_ADMIN_ASSIGN=1 ako baš mora)");
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, role: true, email: true, name: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN", passwordHash, name: name || existing.name },
        select: { id: true, email: true, name: true, role: true },
      })
    : await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: "ADMIN",
        },
        select: { id: true, email: true, name: true, role: true },
      });

  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: { adminRole: role },
    create: { userId: user.id, adminRole: role },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: user.id,
        email: user.email,
        role: user.role,
        adminRole: role,
        created: !existing,
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
