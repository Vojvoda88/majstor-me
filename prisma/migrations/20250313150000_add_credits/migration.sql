-- AlterTable
ALTER TABLE "handyman_profiles" ADD COLUMN IF NOT EXISTS "credits_balance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "credit_transactions" (
    "id" TEXT NOT NULL,
    "handyman_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference_id" TEXT,
    "balance_after" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "credit_transactions_handyman_id_idx" ON "credit_transactions"("handyman_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'credit_transactions_handyman_id_fkey') THEN
        ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_handyman_id_fkey"
            FOREIGN KEY ("handyman_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
