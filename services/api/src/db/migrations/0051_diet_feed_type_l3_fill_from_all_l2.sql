-- 0051_diet_feed_type_l3_fill_from_all_l2.sql
-- Ensure every diet_subtype (L2) has at least one diet_feed_type (L3) item.
-- Storage stays key/id-based; labels are resolved via i18n keys.

-- 1) Ensure L3 category exists and is active
INSERT OR IGNORE INTO master_categories (
  id, code, sort_order, status, created_at, updated_at
) VALUES (
  'mc-diet-feed-type',
  'diet_feed_type',
  131,
  'active',
  datetime('now'),
  datetime('now')
);

UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('diet_type', 'diet_subtype', 'diet_feed_type');

-- 2) Backfill one L3 item for each L2 that has no L3 child yet
WITH l3_cat AS (
  SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1
),
targets AS (
  SELECT
    'mi-diet-feed-' || replace(l2.code, '_', '-') || '-core' AS id,
    l2.id AS parent_item_id,
    l2.code || '_core' AS code,
    (COALESCE(l2.sort_order, 0) * 10) + 1 AS sort_order
  FROM master_items l2
  JOIN master_categories c2
    ON c2.id = l2.category_id
   AND c2.code = 'diet_subtype'
  WHERE NOT EXISTS (
    SELECT 1
    FROM master_items c
    WHERE c.parent_item_id = l2.id
      AND c.category_id = (SELECT id FROM l3_cat)
  )
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  t.id,
  (SELECT id FROM l3_cat),
  t.parent_item_id,
  t.code,
  t.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM targets t;

-- 3) i18n key for L3 category
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
VALUES (
  lower(hex(randomblob(16))),
  'master.diet_feed_type',
  'master',
  '사료종류',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  'Feed Type',
  1,
  datetime('now'),
  datetime('now')
);

-- 4) i18n keys for generated L3 items (derived from L2 translation)
WITH l3_cat AS (
  SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1
),
generated AS (
  SELECT
    l3.code AS l3_code,
    l2.code AS l2_code,
    COALESCE(NULLIF(t2.ko, ''), l2.code) AS l2_ko,
    COALESCE(NULLIF(t2.en, ''), l2.code) AS l2_en
  FROM master_items l3
  JOIN master_items l2
    ON l2.id = l3.parent_item_id
  JOIN master_categories c2
    ON c2.id = l2.category_id
   AND c2.code = 'diet_subtype'
  LEFT JOIN i18n_translations t2
    ON t2.key = 'master.diet_subtype.' || l2.code
  WHERE l3.category_id = (SELECT id FROM l3_cat)
    AND l3.code LIKE '%_core'
),
t(key, ko, en) AS (
  SELECT
    'master.diet_feed_type.' || g.l3_code,
    g.l2_ko || ' 기본형',
    g.l2_en || ' Core'
  FROM generated g
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  'master',
  t.ko,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH l3_cat AS (
  SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1
),
generated AS (
  SELECT
    l3.code AS l3_code,
    l2.code AS l2_code,
    COALESCE(NULLIF(t2.ko, ''), l2.code) AS l2_ko,
    COALESCE(NULLIF(t2.en, ''), l2.code) AS l2_en
  FROM master_items l3
  JOIN master_items l2
    ON l2.id = l3.parent_item_id
  JOIN master_categories c2
    ON c2.id = l2.category_id
   AND c2.code = 'diet_subtype'
  LEFT JOIN i18n_translations t2
    ON t2.key = 'master.diet_subtype.' || l2.code
  WHERE l3.category_id = (SELECT id FROM l3_cat)
    AND l3.code LIKE '%_core'
),
t(key, ko, en) AS (
  SELECT
    'master.diet_feed_type.' || g.l3_code,
    g.l2_ko || ' 기본형',
    g.l2_en || ' Core'
  FROM generated g
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
  ja = COALESCE(NULLIF(ja, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  zh_cn = COALESCE(NULLIF(zh_cn, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  zh_tw = COALESCE(NULLIF(zh_tw, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  es = COALESCE(NULLIF(es, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  fr = COALESCE(NULLIF(fr, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  de = COALESCE(NULLIF(de, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  pt = COALESCE(NULLIF(pt, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  vi = COALESCE(NULLIF(vi, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  th = COALESCE(NULLIF(th, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  id_lang = COALESCE(NULLIF(id_lang, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  ar = COALESCE(NULLIF(ar, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);
