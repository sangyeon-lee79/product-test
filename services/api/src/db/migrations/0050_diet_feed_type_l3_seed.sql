-- 0050_diet_feed_type_l3_seed.sql
-- Diet master hierarchy extension:
-- L1: diet_type
-- L2: diet_subtype
-- L3: diet_feed_type (feed category for product linkage)

-- 1) Ensure L3 category exists and active
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

-- 2) Ensure baseline L1/L2 keys exist (key-only storage)
WITH l1(id, code, sort_order) AS (
  VALUES
    ('mi-diet-dry-food', 'dry_food', 1),
    ('mi-diet-wet-food', 'wet_food', 2),
    ('mi-diet-prescription-food', 'prescription_food', 6)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  l1.id,
  c.id,
  NULL,
  l1.code,
  l1.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM l1
JOIN master_categories c ON c.code = 'diet_type';

WITH l2(id, parent_l1_code, code, sort_order) AS (
  VALUES
    ('mi-diet-sub-puppy-dry-food', 'dry_food', 'puppy_dry_food', 1),
    ('mi-diet-sub-adult-dry-food', 'dry_food', 'adult_dry_food', 2),
    ('mi-diet-sub-senior-dry-food', 'dry_food', 'senior_dry_food', 3),
    ('mi-diet-sub-grain-free-dry', 'dry_food', 'grain_free_dry', 7),
    ('mi-diet-sub-canned-food', 'wet_food', 'canned_food', 20),
    ('mi-diet-sub-diabetes-diet', 'prescription_food', 'diabetes_diet', 51),
    ('mi-diet-sub-kidney-diet', 'prescription_food', 'kidney_diet', 50),
    ('mi-diet-sub-allergy-diet', 'prescription_food', 'allergy_diet', 54)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  l2.id,
  c2.id,
  p.id,
  l2.code,
  l2.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM l2
JOIN master_categories c2 ON c2.code = 'diet_subtype'
JOIN master_items p
  ON p.code = l2.parent_l1_code
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_type' LIMIT 1);

-- 3) L3 feed type seed (parent=L2 diet_subtype)
WITH l3(id, parent_l2_code, code, sort_order) AS (
  VALUES
    ('mi-diet-feed-puppy-growth-formula', 'puppy_dry_food', 'puppy_growth_formula', 1),
    ('mi-diet-feed-puppy-small-breed-formula', 'puppy_dry_food', 'puppy_small_breed_formula', 2),
    ('mi-diet-feed-adult-daily-formula', 'adult_dry_food', 'adult_daily_formula', 10),
    ('mi-diet-feed-adult-weight-control-formula', 'adult_dry_food', 'adult_weight_control_formula', 11),
    ('mi-diet-feed-senior-joint-care-formula', 'senior_dry_food', 'senior_joint_care_formula', 20),
    ('mi-diet-feed-grain-free-salmon-formula', 'grain_free_dry', 'grain_free_salmon_formula', 30),
    ('mi-diet-feed-canned-pate-formula', 'canned_food', 'canned_pate_formula', 40),
    ('mi-diet-feed-canned-chunk-formula', 'canned_food', 'canned_chunk_formula', 41),
    ('mi-diet-feed-diabetes-low-carb-formula', 'diabetes_diet', 'diabetes_low_carb_formula', 50),
    ('mi-diet-feed-kidney-low-phosphorus-formula', 'kidney_diet', 'kidney_low_phosphorus_formula', 51),
    ('mi-diet-feed-hypoallergenic-hydrolyzed-formula', 'allergy_diet', 'hypoallergenic_hydrolyzed_formula', 60)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  l3.id,
  c3.id,
  p.id,
  l3.code,
  l3.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM l3
JOIN master_categories c3 ON c3.code = 'diet_feed_type'
JOIN master_items p
  ON p.code = l3.parent_l2_code
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_subtype' LIMIT 1);

-- 4) i18n rows (category + l3 items), key-based storage and locale rendering
WITH t(key, ko, en) AS (
  VALUES
    ('master.diet_feed_type', '사료종류', 'Feed Type'),

    ('master.diet_feed_type.puppy_growth_formula', '퍼피 성장 포뮬라', 'Puppy Growth Formula'),
    ('master.diet_feed_type.puppy_small_breed_formula', '퍼피 소형견 포뮬라', 'Puppy Small-breed Formula'),
    ('master.diet_feed_type.adult_daily_formula', '어덜트 데일리 포뮬라', 'Adult Daily Formula'),
    ('master.diet_feed_type.adult_weight_control_formula', '어덜트 체중관리 포뮬라', 'Adult Weight-control Formula'),
    ('master.diet_feed_type.senior_joint_care_formula', '시니어 관절 케어 포뮬라', 'Senior Joint-care Formula'),
    ('master.diet_feed_type.grain_free_salmon_formula', '그레인프리 연어 포뮬라', 'Grain-free Salmon Formula'),
    ('master.diet_feed_type.canned_pate_formula', '캔 파테 포뮬라', 'Canned Pate Formula'),
    ('master.diet_feed_type.canned_chunk_formula', '캔 청크 포뮬라', 'Canned Chunk Formula'),
    ('master.diet_feed_type.diabetes_low_carb_formula', '당뇨 저탄수 포뮬라', 'Diabetes Low-carb Formula'),
    ('master.diet_feed_type.kidney_low_phosphorus_formula', '신장 저인 포뮬라', 'Kidney Low-phosphorus Formula'),
    ('master.diet_feed_type.hypoallergenic_hydrolyzed_formula', '저알러지 가수분해 포뮬라', 'Hypoallergenic Hydrolyzed Formula')
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

WITH t(key, ko, en) AS (
  VALUES
    ('master.diet_feed_type', '사료종류', 'Feed Type'),
    ('master.diet_feed_type.puppy_growth_formula', '퍼피 성장 포뮬라', 'Puppy Growth Formula'),
    ('master.diet_feed_type.puppy_small_breed_formula', '퍼피 소형견 포뮬라', 'Puppy Small-breed Formula'),
    ('master.diet_feed_type.adult_daily_formula', '어덜트 데일리 포뮬라', 'Adult Daily Formula'),
    ('master.diet_feed_type.adult_weight_control_formula', '어덜트 체중관리 포뮬라', 'Adult Weight-control Formula'),
    ('master.diet_feed_type.senior_joint_care_formula', '시니어 관절 케어 포뮬라', 'Senior Joint-care Formula'),
    ('master.diet_feed_type.grain_free_salmon_formula', '그레인프리 연어 포뮬라', 'Grain-free Salmon Formula'),
    ('master.diet_feed_type.canned_pate_formula', '캔 파테 포뮬라', 'Canned Pate Formula'),
    ('master.diet_feed_type.canned_chunk_formula', '캔 청크 포뮬라', 'Canned Chunk Formula'),
    ('master.diet_feed_type.diabetes_low_carb_formula', '당뇨 저탄수 포뮬라', 'Diabetes Low-carb Formula'),
    ('master.diet_feed_type.kidney_low_phosphorus_formula', '신장 저인 포뮬라', 'Kidney Low-phosphorus Formula'),
    ('master.diet_feed_type.hypoallergenic_hydrolyzed_formula', '저알러지 가수분해 포뮬라', 'Hypoallergenic Hydrolyzed Formula')
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
