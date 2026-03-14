-- CreateEnum
CREATE TYPE "RequestAdminStatus" AS ENUM ('PENDING_REVIEW', 'DISTRIBUTED', 'HAS_OFFERS', 'CONTACT_UNLOCKED', 'CLOSED', 'SPAM', 'DELETED');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'BANNED');

-- AlterTable: Request - add adminStatus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='requests' AND column_name='admin_status') THEN
    ALTER TABLE "requests" ADD COLUMN "admin_status" "RequestAdminStatus" DEFAULT 'PENDING_REVIEW';
    UPDATE "requests" SET "admin_status" = 'DISTRIBUTED' WHERE "admin_status" = 'PENDING_REVIEW';
  END IF;
END $$;

-- AlterTable: HandymanProfile - add workerStatus
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='handyman_profiles' AND column_name='worker_status') THEN
    ALTER TABLE "handyman_profiles" ADD COLUMN "worker_status" "WorkerStatus";
    UPDATE "handyman_profiles" SET "worker_status" = 'ACTIVE';
    ALTER TABLE "handyman_profiles" ALTER COLUMN "worker_status" SET DEFAULT 'PENDING_REVIEW';
  END IF;
END $$;
