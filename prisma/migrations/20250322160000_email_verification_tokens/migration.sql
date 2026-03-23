-- Tokeni za potvrdu emaila (password registracija). Postojeći korisnici ostaju „potvrđeni“.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_expires_at" TIMESTAMP(3);

UPDATE "users"
SET "email_verified" = COALESCE("email_verified", NOW())
WHERE "email_verified" IS NULL;

CREATE UNIQUE INDEX "users_email_verification_token_hash_key" ON "users"("email_verification_token_hash");
