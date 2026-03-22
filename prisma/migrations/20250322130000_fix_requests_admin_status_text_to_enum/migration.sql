-- Production: neke baze imaju requests.admin_status kao TEXT/VARCHAR (npr. db push / ručno),
-- dok Prisma generiše poređenje sa tipom RequestAdminStatus → greška:
--   operator does not exist: text = "RequestAdminStatus"
-- Ova migracija usklađuje kolonu sa PostgreSQL enum-om ako još nije.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'requests'
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = current_schema()
      AND c.table_name = 'requests'
      AND c.column_name = 'admin_status'
  ) THEN
    RETURN;
  END IF;

  -- Već je PostgreSQL enum — ništa
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = current_schema()
      AND c.table_name = 'requests'
      AND c.column_name = 'admin_status'
      AND c.udt_name = 'RequestAdminStatus'
  ) THEN
    RETURN;
  END IF;

  -- Samo ako je TEXT / VARCHAR
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = current_schema()
      AND c.table_name = 'requests'
      AND c.column_name = 'admin_status'
      AND c.data_type IN ('text', 'character varying')
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RequestAdminStatus') THEN
    CREATE TYPE "RequestAdminStatus" AS ENUM (
      'PENDING_REVIEW',
      'DISTRIBUTED',
      'HAS_OFFERS',
      'CONTACT_UNLOCKED',
      'CLOSED',
      'SPAM',
      'DELETED'
    );
  END IF;

  ALTER TABLE "requests" ALTER COLUMN "admin_status" DROP DEFAULT;

  ALTER TABLE "requests"
    ALTER COLUMN "admin_status" TYPE "RequestAdminStatus"
    USING (
      CASE
        WHEN "admin_status" IS NULL THEN NULL::"RequestAdminStatus"
        WHEN TRIM("admin_status"::text) IN (
          'PENDING_REVIEW',
          'DISTRIBUTED',
          'HAS_OFFERS',
          'CONTACT_UNLOCKED',
          'CLOSED',
          'SPAM',
          'DELETED'
        ) THEN TRIM("admin_status"::text)::"RequestAdminStatus"
        ELSE 'PENDING_REVIEW'::"RequestAdminStatus"
      END
    );

  ALTER TABLE "requests"
    ALTER COLUMN "admin_status" SET DEFAULT 'PENDING_REVIEW'::"RequestAdminStatus";
END $$;
