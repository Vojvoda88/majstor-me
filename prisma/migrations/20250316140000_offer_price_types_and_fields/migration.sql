-- Novi tipovi cijene u ponudi + opciona polja (jedna fleksibilna forma)
ALTER TYPE "PriceType" ADD VALUE 'PREGLED_PA_KONACNA';
ALTER TYPE "PriceType" ADD VALUE 'PO_SATU';
ALTER TYPE "PriceType" ADD VALUE 'PO_M2';
ALTER TYPE "PriceType" ADD VALUE 'PO_METRU_DUZNOM';
ALTER TYPE "PriceType" ADD VALUE 'PO_TURI';
ALTER TYPE "PriceType" ADD VALUE 'DRUGO';

ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "price_type_other_label" VARCHAR(200);
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "availability_window" VARCHAR(80);
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "included_in_price" TEXT;
ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "extra_note" TEXT;
