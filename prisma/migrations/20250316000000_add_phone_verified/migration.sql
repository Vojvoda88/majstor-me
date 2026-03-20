-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified" TIMESTAMP(3);
