-- Soft-delete kolona za zahtjeve (usklađivanje sa prisma/schema.prisma → Request.deletedAt).
-- Sigurno: ADD COLUMN IF NOT EXISTS — ne dira postojeće redove (NULL = nije obrisan).
-- Indeks nije u schema @@index([deletedAt]); liste filtriraju deletedAt IS NULL uz ostale indekse.

ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
