-- Guest pristup: čuvamo samo SHA-256 heks tajnog linka (ne plain token).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "guest_access_token_hash" TEXT;

UPDATE "requests"
SET "guest_access_token_hash" = encode(digest("requester_token", 'sha256'), 'hex')
WHERE "requester_token" IS NOT NULL;

ALTER TABLE "requests" DROP CONSTRAINT IF EXISTS "requests_requester_token_key";

ALTER TABLE "requests" DROP COLUMN IF EXISTS "requester_token";

CREATE UNIQUE INDEX "requests_guest_access_token_hash_key" ON "requests"("guest_access_token_hash");
