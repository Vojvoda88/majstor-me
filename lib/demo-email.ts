/**
 * Jedan izvor za prepoznavanje demo / test naloga (seed-demo, prisma/seed test).
 * Koristi se za isključenje iz distribucije (toNotify) i javnog listinga majstora.
 */

import type { Prisma } from "@prisma/client";

export const DEMO_EMAIL_SUFFIX = "@local.majstor.demo";

/** Korisnici iz prisma/seed.ts (npr. marko@test.me) */
export const TEST_ME_EMAIL_SUFFIX = "@test.me";

/** Ne uključivati u distribuciju push/notifikacija i u javni handyman listing */
export const DISTRIBUTION_EXCLUDED_EMAIL_SUFFIXES = [
  DEMO_EMAIL_SUFFIX,
  TEST_ME_EMAIL_SUFFIX,
] as const;

/** E2E skripte (npr. scripts/check-last-e2e-handyman.ts) — ne smije na javne listinge */
const E2E_MAJSTOR_EMAIL_SNIPPET = "e2e_majstor_";

/**
 * Isti semantički skup kao `prismaWherePublicHandymanListingUserNotExcluded` — za unit provjere.
 */
export function isUserExcludedFromPublicHandymanSurfaces(
  email: string,
  name: string | null | undefined
): boolean {
  const e = email.trim().toLowerCase();
  if (e.endsWith(DEMO_EMAIL_SUFFIX) || e.endsWith(TEST_ME_EMAIL_SUFFIX)) return true;
  if (e.includes(E2E_MAJSTOR_EMAIL_SNIPPET)) return true;
  const n = (name ?? "").trim();
  if (!n) return false;
  const nl = n.toLowerCase();
  if (nl.includes("smoke")) return true;
  if (nl.includes("backlog")) return true;
  return false;
}

/**
 * Prisma: demo / test emailovi (admin KPI, distribucija, interne liste) — **bez** filtriranja po imenu
 * (da admin i dalje vidi naloge po imenu ako treba).
 */
export function prismaWhereHandymanEmailNotDemo(): Pick<Prisma.UserWhereInput, "NOT"> {
  return {
    NOT: {
      OR: [
        { email: { endsWith: DEMO_EMAIL_SUFFIX } },
        { email: { endsWith: TEST_ME_EMAIL_SUFFIX } },
        { email: { contains: E2E_MAJSTOR_EMAIL_SNIPPET, mode: "insensitive" } },
      ],
    },
  };
}

/**
 * Javni katalog (listing API, grad/kategorija/SEO, profil, početna, sitemap): email + interna imena (smoke/backlog).
 */
export function prismaWherePublicHandymanListingUserNotExcluded(): Pick<Prisma.UserWhereInput, "NOT"> {
  return {
    NOT: {
      OR: [
        { email: { endsWith: DEMO_EMAIL_SUFFIX } },
        { email: { endsWith: TEST_ME_EMAIL_SUFFIX } },
        { email: { contains: E2E_MAJSTOR_EMAIL_SNIPPET, mode: "insensitive" } },
        { name: { contains: "Smoke", mode: "insensitive" } },
        { name: { contains: "Backlog", mode: "insensitive" } },
      ],
    },
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCommaEnvList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Ručno: UUID naloga koje ne smiju na javni katalog (test na Gmail itd.).
 * `HANDYMAN_PUBLIC_EXCLUDE_USER_IDS=id1,id2` — Vercel env ili lokalno .env
 */
export function getHandymanPublicExtraExcludeUserIdsFromEnv(): string[] {
  return parseCommaEnvList(process.env.HANDYMAN_PUBLIC_EXCLUDE_USER_IDS).filter((id) =>
    UUID_RE.test(id)
  );
}

/**
 * Ručno: tačan email test naloga (case-insensitive).
 * `HANDYMAN_PUBLIC_EXCLUDE_EMAILS=a@gmail.com,b@company.me`
 */
export function getHandymanPublicExtraExcludeEmailsFromEnv(): string[] {
  return parseCommaEnvList(process.env.HANDYMAN_PUBLIC_EXCLUDE_EMAILS);
}

/**
 * Dodatni AND-uslovi za ručno isključenje test naloga (env).
 * Koristi u `buildPublicHandymanListingWhere` i `prismaWhereUserActiveHandymanForPublicCatalog`.
 */
export function prismaAndClausesForPublicHandymanManualExcludes(): Prisma.UserWhereInput[] {
  const parts: Prisma.UserWhereInput[] = [];
  const extraExcludeIds = getHandymanPublicExtraExcludeUserIdsFromEnv();
  if (extraExcludeIds.length > 0) {
    parts.push({ id: { notIn: extraExcludeIds } });
  }
  const extraExcludeEmails = getHandymanPublicExtraExcludeEmailsFromEnv();
  if (extraExcludeEmails.length > 0) {
    parts.push({
      NOT: {
        OR: extraExcludeEmails.map((email) => ({
          email: { equals: email, mode: "insensitive" as const },
        })),
      },
    });
  }
  return parts;
}
