-- Replace public category "Servis bijele tehnike" with "Grubi građevinski radovi"
-- (internal name on Request; Category.name / slug for workers & listings)

UPDATE "categories"
SET
  "name" = 'Grubi građevinski radovi',
  "slug" = 'grubi-gradjevinski-radovi'
WHERE "name" = 'Servis bijele tehnike';

UPDATE "requests"
SET "category" = 'Grubi građevinski radovi'
WHERE "category" = 'Servis bijele tehnike';
