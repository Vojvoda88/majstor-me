-- Dodatne kategorije isključivo za admin-trigger distribuciju (ne mijenja glavni category).
ALTER TABLE "requests" ADD COLUMN "extra_distribution_categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
