/**
 * Lokalna dijagnostika: da li nalog postoji u ISTOJ bazi kao Prisma (DATABASE_URL).
 * Ne loguje lozinku; ispisuje samo korake.
 *
 *   npx tsx scripts/verify-login-db.ts marko@test.me "Test123!"
 */
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3];
  if (!emailArg || !passwordArg) {
    console.error("Usage: npx tsx scripts/verify-login-db.ts <email> <password>");
    process.exit(1);
  }

  const normalized = emailArg.trim().toLowerCase();
  console.log("DATABASE_URL host (bez lozinke):", maskUrl(process.env.DATABASE_URL));

  const byUnique = await prisma.user.findUnique({ where: { email: normalized } });
  const byInsensitive = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
  });

  console.log(JSON.stringify({
    step: "lookup",
    findUnique_lowercase: byUnique ? { id: byUnique.id, emailInDb: byUnique.email, role: byUnique.role } : null,
    findFirst_insensitive: byInsensitive
      ? { id: byInsensitive.id, emailInDb: byInsensitive.email, role: byInsensitive.role }
      : null,
    mismatchUniqueVsInsensitive: byUnique?.id !== byInsensitive?.id,
  }, null, 2));

  const user = byInsensitive;
  if (!user) {
    console.log("RESULT: user not found — login će vratiti 401 (authorize null)");
    return;
  }

  const hashLen = user.passwordHash?.length ?? 0;
  console.log(JSON.stringify({
    step: "passwordHash",
    hashLength: hashLen,
    hashLooksLikeBcrypt: user.passwordHash?.startsWith("$2") ?? false,
  }, null, 2));

  if (!user.passwordHash) {
    console.log("RESULT: passwordHash prazan — nalog nije credentials (ili pokvareno) — 401");
    return;
  }

  const ok = await compare(passwordArg, user.passwordHash);
  console.log(JSON.stringify({ step: "bcrypt.compare", ok }, null, 2));
  console.log(ok ? "RESULT: lozinka OK — authorize bi trebalo da prođe" : "RESULT: lozinka NE odgovara hash-u — 401");
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
