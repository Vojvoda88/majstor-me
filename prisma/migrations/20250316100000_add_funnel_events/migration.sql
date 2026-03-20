-- CreateTable
CREATE TABLE "funnel_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "funnel_events_event_idx" ON "funnel_events"("event");

-- CreateIndex
CREATE INDEX "funnel_events_user_id_idx" ON "funnel_events"("user_id");

-- CreateIndex
CREATE INDEX "funnel_events_created_at_idx" ON "funnel_events"("created_at");
