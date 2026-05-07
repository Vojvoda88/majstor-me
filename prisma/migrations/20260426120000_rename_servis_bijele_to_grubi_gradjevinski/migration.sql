-- Replace public category "Servis bijele tehnike" with "Grubi građevinski radovi"
-- (internal name on Request; Category.name / slug for workers & listings)
-- Idempotent + safe when both category rows already exist.

DO $$
DECLARE
  old_id TEXT;
  new_id TEXT;
BEGIN
  SELECT id INTO old_id FROM "categories" WHERE "name" = 'Servis bijele tehnike' LIMIT 1;
  SELECT id INTO new_id FROM "categories" WHERE "name" = 'Grubi građevinski radovi' LIMIT 1;

  IF old_id IS NOT NULL THEN
    IF new_id IS NULL THEN
      UPDATE "categories"
      SET
        "name" = 'Grubi građevinski radovi',
        "slug" = 'grubi-gradjevinski-radovi'
      WHERE id = old_id;
    ELSE
      -- Obriši eventualne duplikate veza pa prebaci sve worker veze na novu kategoriju.
      DELETE FROM "worker_categories" wc_old
      USING "worker_categories" wc_new
      WHERE wc_old."category_id" = old_id
        AND wc_new."category_id" = new_id
        AND wc_old."worker_id" = wc_new."worker_id";

      UPDATE "worker_categories"
      SET "category_id" = new_id
      WHERE "category_id" = old_id;

      DELETE FROM "categories" WHERE id = old_id;

      UPDATE "categories"
      SET "slug" = 'grubi-gradjevinski-radovi'
      WHERE id = new_id;
    END IF;
  END IF;
END $$;

UPDATE "requests"
SET "category" = 'Grubi građevinski radovi'
WHERE "category" = 'Servis bijele tehnike';
