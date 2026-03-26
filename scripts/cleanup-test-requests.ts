/**
 * Jednokratni production-safe cleanup SAMO očiglednih test/E2E/demo zahtjeva.
 *
 * NE dira zahtjeve koji ne zadovoljavaju striktne kriterijume ispod.
 *
 *   npx tsx scripts/cleanup-test-requests.ts --dry-run
 *   npx tsx scripts/cleanup-test-requests.ts --execute
 *
 * Env: DATABASE_URL (isti kao Prisma). Bez --execute nema izmjena u bazi.
 */
import { PrismaClient, RequestAdminStatus, type Prisma } from "@prisma/client";
import { DEMO_EMAIL_SUFFIX, TEST_ME_EMAIL_SUFFIX } from "../lib/demo-email";

const prisma = new PrismaClient();

const CRITERIA_LOG = {
  source: "scripts/cleanup-test-requests.ts",
  description:
    "Zahtjev se smatra test podatkom ako zadovoljava BILO KOJI od uslova (OR):",
  rules: [
    `title (case-insensitive) sadrži tačan podstring "E2E test" (pokriva Playwright default "E2E test zahtjev")`,
    `description (case-insensitive) sadrži "Opis za E2E test" (Playwright default opis; ne koristi opšti "E2E test" u opisu zbog rizika false positive)`,
    `requesterName (case-insensitive) jednako "E2E Test Korisnik" (Playwright default ime gosta)`,
    `povezan user.email završava na ${TEST_ME_EMAIL_SUFFIX} ili ${DEMO_EMAIL_SUFFIX} (lib/demo-email — SVI zahtjevi tih naloga, uključujući seed-demo naslove; ne dira ostale domene)`,
    `guest: userId IS NULL i requesterEmail počinje sa "gost." i završava na "@local.invalid" (isto kao audit-production-demo-patterns)`,
  ],
  exclusion:
    "Preskaču se redovi koji su već soft-delete: adminStatus=DELETED ili deletedAt != null.",
} as const;

/** Samo OR grana — identifikacija test zahtjeva (bez filtera na deleted). */
function buildTestPatternWhere(): Prisma.RequestWhereInput {
  return {
    OR: [
      { title: { contains: "E2E test", mode: "insensitive" } },
      { description: { contains: "Opis za E2E test", mode: "insensitive" } },
      { requesterName: { equals: "E2E Test Korisnik", mode: "insensitive" } },
      { user: { email: { endsWith: TEST_ME_EMAIL_SUFFIX } } },
      { user: { email: { endsWith: DEMO_EMAIL_SUFFIX } } },
      {
        userId: null,
        AND: [
          { requesterEmail: { startsWith: "gost." } },
          { requesterEmail: { endsWith: "@local.invalid" } },
        ],
      },
    ],
  };
}

function buildAlreadyCleanedWhere(): Prisma.RequestWhereInput {
  return {
    OR: [
      { deletedAt: { not: null } },
      { adminStatus: RequestAdminStatus.DELETED },
    ],
  };
}

/** Za update: test pattern i još nije soft-delete. */
function buildEligibleWhere(): Prisma.RequestWhereInput {
  return {
    AND: [buildTestPatternWhere(), { NOT: buildAlreadyCleanedWhere() }],
  };
}

function parseArgs(): "dry-run" | "execute" {
  const argv = process.argv.slice(2);
  const hasDry = argv.includes("--dry-run");
  const hasExec = argv.includes("--execute");
  if (hasDry && hasExec) {
    console.error("Koristi samo jedan od: --dry-run | --execute");
    process.exit(1);
  }
  if (!hasDry && !hasExec) {
    console.error(
      "Usage: npx tsx scripts/cleanup-test-requests.ts --dry-run\n       npx tsx scripts/cleanup-test-requests.ts --execute"
    );
    process.exit(1);
  }
  return hasExec ? "execute" : "dry-run";
}

async function main() {
  const mode = parseArgs();

  console.log(JSON.stringify(CRITERIA_LOG, null, 2));
  console.log("\nDATABASE_URL host (bez lozinke):", maskDatabaseUrl(process.env.DATABASE_URL));
  console.log("Mode:", mode, "\n");

  const patternWhere = buildTestPatternWhere();
  const eligibleWhere = buildEligibleWhere();

  const [totalMatchPattern, alreadyCleaned, eligibleCount] = await Promise.all([
    prisma.request.count({ where: patternWhere }),
    prisma.request.count({
      where: { AND: [patternWhere, buildAlreadyCleanedWhere()] },
    }),
    prisma.request.count({ where: eligibleWhere }),
  ]);

  console.log("found_total (match pattern, bilo koji status):", totalMatchPattern);
  console.log("skipped_already_soft_deleted:", alreadyCleaned);
  console.log("eligible_to_change (match pattern, još nije soft-delete):", eligibleCount);

  const preview = await prisma.request.findMany({
    where: eligibleWhere,
    select: {
      id: true,
      title: true,
      adminStatus: true,
      deletedAt: true,
      requesterEmail: true,
      requesterName: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  if (eligibleCount === 0) {
    console.log("\nNema redova za izmjenu (eligible = 0). Završetak bez greške.");
    return;
  }

  console.log(`\nPreview (max 80 od ${eligibleCount} eligible):`);
  for (const r of preview) {
    const email = r.user?.email ?? r.requesterEmail ?? "(nema email)";
    const title = r.title ?? "(bez naslova)";
    console.log(`  ${r.id} | ${title} | ${email}`);
  }
  if (eligibleCount > preview.length) {
    console.log(`  ... i još ${eligibleCount - preview.length} red(ova).`);
  }

  if (mode === "dry-run") {
    console.log("\n[DRY-RUN] Nije izvršena nijedna izmjena u bazi.");
    console.log(`[DRY-RUN] Za soft-delete ovih ${eligibleCount} redova pokreni sa --execute.`);
    return;
  }

  const result = await prisma.request.updateMany({
    where: eligibleWhere,
    data: {
      adminStatus: RequestAdminStatus.DELETED,
      deletedAt: new Date(),
    },
  });

  console.log("\n[EXECUTE] changed_count (updateMany):", result.count);
  if (result.count !== eligibleCount) {
    console.warn(
      "[EXECUTE] Upozorenje: changed_count !== eligible_count prije updatea (mogući paralelni update). Provjeri ručno."
    );
  }
}

function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return "(nije postavljen)";
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return u.host + u.pathname;
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
