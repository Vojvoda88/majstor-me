-- worker_categories migration
-- 1) Create categories table
-- 2) Create worker_categories table
-- 3) Seed categories from REQUEST_CATEGORIES
-- 4) Migrate handyman_profiles.categories (string array) to worker_categories
-- 5) Drop categories column from handyman_profiles
-- 6) FKs included in worker_categories creation

-- Step 1: Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name");

-- Step 2: Seed categories from REQUEST_CATEGORIES (idempotent - skip if name exists)
INSERT INTO "categories" ("id", "name")
SELECT gen_random_uuid()::text, v.name
FROM (VALUES
    ('Vodoinstalater'),
    ('Električar'),
    ('Klima servis'),
    ('Moler / sitne kućne popravke'),
    ('Montaža namještaja'),
    ('PVC stolarija'),
    ('Krovopokrivač'),
    ('Čišćenje'),
    ('Selidbe'),
    ('Keramičar'),
    ('Moler / gipsar'),
    ('Stolar'),
    ('Bravar'),
    ('Parketar'),
    ('Fasade / izolacija'),
    ('Građevinski radovi'),
    ('Servis bojlera'),
    ('Servis bijele tehnike'),
    ('Servis veš mašina'),
    ('Servis frižidera'),
    ('Servis šporeta / rerne'),
    ('Servis elektronike'),
    ('Servis računara / laptopa'),
    ('TV / antene / internet instalacije'),
    ('Ugradnja kuhinja'),
    ('Dubinsko čišćenje'),
    ('Dvorište / bašta'),
    ('Sitne kućne popravke'),
    ('Alarm / video nadzor'),
    ('Roletne / tende'),
    ('Gipsani radovi'),
    ('Sanacija vlage'),
    ('Odvoz šuta / otpada'),
    ('Brave / hitna otvaranja'),
    ('Solarni sistemi / paneli')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM "categories" c WHERE c.name = v.name);

-- Step 3: Create worker_categories table with FKs
CREATE TABLE IF NOT EXISTS "worker_categories" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "worker_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "worker_categories_worker_id_category_id_key" ON "worker_categories"("worker_id", "category_id");
CREATE INDEX IF NOT EXISTS "worker_categories_worker_id_idx" ON "worker_categories"("worker_id");
CREATE INDEX IF NOT EXISTS "worker_categories_category_id_idx" ON "worker_categories"("category_id");

-- Step 4: Migrate handyman_profiles.categories to worker_categories (only if categories column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'handyman_profiles' AND column_name = 'categories'
    ) THEN
        INSERT INTO "worker_categories" ("id", "worker_id", "category_id")
        SELECT gen_random_uuid()::text, hp.id, c.id
        FROM "handyman_profiles" hp
        CROSS JOIN LATERAL unnest(COALESCE(hp.categories, ARRAY[]::text[])) AS cat_name
        JOIN "categories" c ON c.name = cat_name
        ON CONFLICT ("worker_id", "category_id") DO NOTHING;
    END IF;
END $$;

-- Step 5: Drop categories column from handyman_profiles
ALTER TABLE "handyman_profiles" DROP COLUMN IF EXISTS "categories";

-- Step 6: Add foreign keys (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_categories_worker_id_fkey') THEN
        ALTER TABLE "worker_categories" ADD CONSTRAINT "worker_categories_worker_id_fkey"
            FOREIGN KEY ("worker_id") REFERENCES "handyman_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'worker_categories_category_id_fkey') THEN
        ALTER TABLE "worker_categories" ADD CONSTRAINT "worker_categories_category_id_fkey"
            FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;