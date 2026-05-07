DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HandymanChurnReason') THEN
    CREATE TYPE "HandymanChurnReason" AS ENUM ('SELF_DELETE', 'ADMIN_DELETE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "handyman_churn_events" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "email_snapshot" TEXT,
  "name_snapshot" TEXT,
  "reason" "HandymanChurnReason" NOT NULL,
  "actor_type" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "handyman_churn_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "handyman_churn_events_created_at_idx"
  ON "handyman_churn_events"("created_at");
CREATE INDEX IF NOT EXISTS "handyman_churn_events_reason_idx"
  ON "handyman_churn_events"("reason");
CREATE INDEX IF NOT EXISTS "handyman_churn_events_user_id_idx"
  ON "handyman_churn_events"("user_id");
