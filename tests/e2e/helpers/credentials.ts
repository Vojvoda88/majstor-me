/**
 * Test credentials – seed defaults; override via env.
 * Seed: npm run db:seed (password for all: Test123!)
 */
export const TEST_PASSWORD = process.env.E2E_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "Test123!";

export const CREDS = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "admin@brzimajstor.me",
    password: TEST_PASSWORD,
  },
  user: {
    email: process.env.E2E_USER_EMAIL ?? "marko@test.me",
    password: TEST_PASSWORD,
  },
  /** Smoke E2E objava zahtjeva — izbjegava MAX_REQUESTS_PER_DAY na marko nakon više runova */
  smokeRequester: {
    email: process.env.E2E_SMOKE_REQUESTER_EMAIL ?? "petar@test.me",
    password: TEST_PASSWORD,
  },
  handyman: {
    email: process.env.E2E_HANDYMAN_EMAIL ?? "majstor.vodoinstalater@test.me",
    password: TEST_PASSWORD,
  },
} as const;
