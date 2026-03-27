-- P1 hardening:
-- 1) sprijeci duple ponude po (request, handyman)
-- 2) idempotency key za notifikacije (retry-safe distribucija)

-- Dedup postojećih duplih offer redova (zadržavamo najstariji created_at/id).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY request_id, handyman_id
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM offers
)
DELETE FROM offers o
USING ranked r
WHERE o.id = r.id
  AND r.rn > 1;

-- Jedna ponuda po majstoru za isti zahtjev.
CREATE UNIQUE INDEX IF NOT EXISTS "offers_request_id_handyman_id_key"
  ON "offers"("request_id", "handyman_id");

-- Notification idempotency key (NULL dozvoljen; non-NULL mora biti jedinstven).
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "idempotency_key" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "notifications_idempotency_key_key"
  ON "notifications"("idempotency_key");
