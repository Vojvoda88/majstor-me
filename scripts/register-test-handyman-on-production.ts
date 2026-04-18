/**
 * Registruje novog test-majstora direktno kroz produkcijski API na Vercelu.
 * Push ide kroz Vercel (VAPID) — ne treba ništa lokalno.
 *
 * Pokretanje:
 *   npx tsx scripts/register-test-handyman-on-production.ts
 */

const PRODUCTION_URL = "https://www.brzimajstor.me";

async function main() {
  const ts = Date.now();

  const payload = {
    name: `Test Majstor ${ts}`,
    email: `test.majstor.${ts}@testme.invalid`,
    password: "Majstor123!",
    phone: "+38267999000",
    city: "Podgorica",
    role: "HANDYMAN",
    bio: "Test profil za provjeru admin push notifikacija. Može se obrisati.",
    categories: ["Električar"],
    workCities: ["Podgorica"],
  };

  console.log("Registrujem test majstora na produkciji…");
  console.log("Email:", payload.email);

  const res = await fetch(`${PRODUCTION_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = await res.text().catch(() => "(prazno)");
  }

  if (!res.ok) {
    console.error("Registracija neuspješna:", res.status, json);
    process.exit(1);
  }

  const data = json as { success?: boolean; data?: { id?: string; email?: string; role?: string } };
  const userId = data?.data?.id ?? "nepoznat";

  console.log("\n✓ Majstor registrovan na produkciji:");
  console.log("  ID:", userId);
  console.log("  Email:", payload.email);
  console.log("  Status: PENDING_REVIEW");
  console.log("  Admin URL:", `${PRODUCTION_URL}/admin/handymen/${userId}`);
  console.log("\nAdmin push notifikacija je okidena direktno sa Vercela (pravi VAPID).");
  console.log("Provjeri telefon za obavještenje 'Nova prijava majstora čeka pregled'.");
}

main().catch((e) => {
  console.error("[register-test-handyman-on-production] failed:", e?.message ?? e);
  process.exit(1);
});
