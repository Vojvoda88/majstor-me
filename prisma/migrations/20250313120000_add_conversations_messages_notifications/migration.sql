-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'EMERGENCY_ONLY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable handyman_profiles - add new columns
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "gallery_images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "years_of_experience" INTEGER;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "starting_price" DOUBLE PRECISION;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "completed_jobs_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "average_response_minutes" INTEGER;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "service_areas_description" TEXT;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "travel_radius_km" INTEGER;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "availability_status" "AvailabilityStatus" DEFAULT 'AVAILABLE';
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "is_promoted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "promoted_until" TIMESTAMP(3);

-- CreateTable conversations
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_request_id_key" ON "conversations"("request_id");
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- AddForeignKey (only if tables exist - use DO block for safety)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_request_id_fkey'
    ) THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_request_id_fkey" 
            FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_conversation_id_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" 
            FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" 
            FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
