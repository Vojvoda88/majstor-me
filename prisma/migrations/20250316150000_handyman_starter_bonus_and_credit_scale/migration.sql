-- Start bonus praćenje + skaliranje postojećih salda na novi model (1 kredit ≈ 1 cent u prodaji paketa)
ALTER TABLE "handyman_profiles" ADD COLUMN "starter_bonus_granted_at" TIMESTAMP(3);

-- Postojeći saldi: 10× (npr. staro 100 → 1000) da odgovara novim paketima i cijenama otključavanja
UPDATE "handyman_profiles" SET "credits_balance" = "credits_balance" * 10 WHERE "credits_balance" > 0;
