-- Password reset (hashed token + expiry; plain token only in email)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_token_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_reset_expires_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_hash_key" ON "users"("password_reset_token_hash");
