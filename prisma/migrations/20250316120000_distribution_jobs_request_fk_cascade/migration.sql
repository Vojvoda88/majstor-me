-- Tabela distribution_jobs nije imala raniju migraciju u repou; ova migracija je inicijalno bila samo FK fix.
-- Na bazama gdje tabela ne postoji, prvo je kreiramo (usklađeno sa prisma/schema.prisma modelom DistributionJob).

CREATE TABLE IF NOT EXISTS "distribution_jobs" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "result_meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "distribution_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "distribution_jobs_status_idx" ON "distribution_jobs"("status");
CREATE INDEX IF NOT EXISTS "distribution_jobs_request_id_idx" ON "distribution_jobs"("request_id");
CREATE INDEX IF NOT EXISTS "distribution_jobs_created_at_idx" ON "distribution_jobs"("created_at");

-- Ensure distribution_jobs.request_id references requests with ON DELETE CASCADE
-- (fixes user account deletion when jobs still reference owned requests)

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'distribution_jobs'
      AND c.contype = 'f'
      AND pg_get_constraintdef(c.oid) LIKE '%request_id%'
  ) LOOP
    EXECUTE format('ALTER TABLE "distribution_jobs" DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'distribution_jobs_request_id_fkey'
  ) THEN
    ALTER TABLE "distribution_jobs"
      ADD CONSTRAINT "distribution_jobs_request_id_fkey"
      FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
