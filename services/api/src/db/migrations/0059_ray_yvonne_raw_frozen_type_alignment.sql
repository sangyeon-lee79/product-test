-- 0059_ray_yvonne_raw_frozen_type_alignment.sql
-- Align Ray & Yvonne raw line to L3: raw_frozen_food_core

-- 1) Ensure L2 raw_frozen_food exists under diet_subtype
INSERT OR IGNORE INTO master_items (
  id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at
)
SELECT
  'mi-diet-sub-raw-frozen-food',
  c2.id,
  'raw_frozen_food',
  p.id,
  43,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM master_categories c2
JOIN master_items p
  ON p.code = 'raw_food'
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_type' LIMIT 1)
WHERE c2.code = 'diet_subtype';

-- 2) Ensure L3 raw_frozen_food_core exists under diet_feed_type
INSERT OR IGNORE INTO master_items (
  id, category_id, code, parent_item_id, sort_order, status, metadata, created_at, updated_at
)
SELECT
  'mi-diet-feed-raw-frozen-food-core',
  c3.id,
  'raw_frozen_food_core',
  p.id,
  9008,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM master_categories c3
JOIN master_items p
  ON p.code = 'raw_frozen_food'
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_subtype' LIMIT 1)
WHERE c3.code = 'diet_feed_type';

-- 3) i18n label for new L3 key
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
VALUES (
  lower(hex(randomblob(16))),
  'master.diet_feed_type.raw_frozen_food_core',
  'master',
  '냉동 생식 기본형',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  'Frozen Raw Food Core',
  1,
  datetime('now'),
  datetime('now')
);

UPDATE i18n_translations
SET
  ko = '냉동 생식 기본형',
  en = 'Frozen Raw Food Core',
  updated_at = datetime('now')
WHERE key = 'master.diet_feed_type.raw_frozen_food_core';

-- 4) Remap Ray & Yvonne raw line models to raw_frozen_food_core
UPDATE feed_models
SET
  feed_type_item_id = (
    SELECT mi.id
    FROM master_items mi
    JOIN master_categories mc ON mc.id = mi.category_id
    WHERE mc.code = 'diet_feed_type'
      AND mi.code = 'raw_frozen_food_core'
    LIMIT 1
  ),
  updated_at = datetime('now')
WHERE manufacturer_id = (SELECT id FROM feed_manufacturers WHERE key = 'ray_n_yvonne' LIMIT 1)
  AND brand_id = (SELECT id FROM feed_brands WHERE name_key = 'feed.brand.ray_yvonne_raw_line' LIMIT 1);

-- 5) Align manufacturer-type map:
--    remove old raw_food_core mapping for ray, add raw_frozen_food_core mapping
DELETE FROM feed_manufacturer_type_map
WHERE manufacturer_id = (SELECT id FROM feed_manufacturers WHERE key = 'ray_n_yvonne' LIMIT 1)
  AND type_item_id = (
    SELECT mi.id
    FROM master_items mi
    JOIN master_categories mc ON mc.id = mi.category_id
    WHERE mc.code = 'diet_feed_type'
      AND mi.code = 'raw_food_core'
    LIMIT 1
  );

INSERT OR IGNORE INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  t.id,
  datetime('now')
FROM feed_manufacturers m
JOIN master_items t
  ON t.code = 'raw_frozen_food_core'
 AND t.category_id = (SELECT id FROM master_categories WHERE code = 'diet_feed_type' LIMIT 1)
WHERE m.key = 'ray_n_yvonne';

INSERT OR IGNORE INTO schema_migrations (version)
VALUES ('0059_ray_yvonne_raw_frozen_type_alignment');
