-- CreateTable
CREATE TABLE "credit_cash_activation_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "payment_method" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_cash_activation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_cash_activation_requests_user_id_idx" ON "credit_cash_activation_requests"("user_id");

-- CreateIndex
CREATE INDEX "credit_cash_activation_requests_created_at_idx" ON "credit_cash_activation_requests"("created_at");

-- AddForeignKey
ALTER TABLE "credit_cash_activation_requests" ADD CONSTRAINT "credit_cash_activation_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
