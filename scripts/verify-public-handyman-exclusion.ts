/**
 * Brza regresija: javni filter za demo/smoke/backlog (lib/demo-email).
 * Pokretanje: npx tsx scripts/verify-public-handyman-exclusion.ts
 */
import assert from "node:assert/strict";
import { isUserExcludedFromPublicHandymanSurfaces } from "../lib/demo-email";

const cases: { email: string; name: string | null; ex: boolean }[] = [
  { email: "m@local.majstor.demo", name: "Real", ex: true },
  { email: "x@test.me", name: "Seed", ex: true },
  { email: "x_e2e_majstor_y@test.com", name: "E2E", ex: true },
  { email: "prod@example.com", name: "SH Smoke Handyman", ex: true },
  { email: "prod@example.com", name: "LB Live Backlog Smoke", ex: true },
  { email: "ivan@example.com", name: "Ivan Keramičar", ex: false },
  { email: "marija@example.com", name: "Marija", ex: false },
];

for (const c of cases) {
  assert.equal(
    isUserExcludedFromPublicHandymanSurfaces(c.email, c.name),
    c.ex,
    `${c.email} / ${c.name}`
  );
}

console.log("[verify-public-handyman-exclusion] OK", cases.length, "cases");
