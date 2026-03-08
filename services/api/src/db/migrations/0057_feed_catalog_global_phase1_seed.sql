-- 0057_feed_catalog_global_phase1_seed.sql
-- Phase 1 global feed catalog seed (Royal Canin, Hill's, Orijen, Acana, Ray & Yvonne)
-- Includes:
-- 1) diet_feed_type L3 core keys
-- 2) feed manufacturers/brands/models + multi-parent maps
-- 3) i18n keys for manufacturer/brand/model/nutrient labels
-- 4) nutrient master tables + product nutrient values

-- ---------------------------------------------------------------------------
-- 0) Baseline master categories/items for diet_subtype and diet_feed_type
--    (legacy-compatible: key/is_active schema)
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO master_categories (
  id, key, sort_order, is_active, created_at, updated_at
)
VALUES
  ('mc-diet-subtype', 'diet_subtype', 130, 1, datetime('now'), datetime('now')),
  ('mc-diet-feed-type', 'diet_feed_type', 131, 1, datetime('now'), datetime('now'));

WITH l1(id, key, sort_order) AS (
  VALUES
    ('mi-diet-dry-food', 'dry_food', 1),
    ('mi-diet-wet-food', 'wet_food', 2),
    ('mi-diet-freeze-dried-food', 'freeze_dried_food', 3),
    ('mi-diet-raw-food', 'raw_food', 4),
    ('mi-diet-prescription-food', 'prescription_food', 6),
    ('mi-diet-snack', 'snack', 7)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, key, parent_id, sort_order, is_active, metadata, created_at, updated_at
)
SELECT
  l1.id,
  c.id,
  l1.key,
  NULL,
  l1.sort_order,
  1,
  '{}',
  datetime('now'),
  datetime('now')
FROM l1
JOIN master_categories c ON c.key = 'diet_type';

WITH l2(id, parent_l1_key, key, sort_order) AS (
  VALUES
    ('mi-diet-sub-adult-dry-food', 'dry_food', 'adult_dry_food', 2),
    ('mi-diet-sub-canned-food', 'wet_food', 'canned_food', 20),
    ('mi-diet-sub-raw-meat', 'raw_food', 'raw_meat', 40),
    ('mi-diet-sub-freeze-dried-complete', 'freeze_dried_food', 'freeze_dried_complete', 31),
    ('mi-diet-sub-freeze-dried-snack', 'freeze_dried_food', 'freeze_dried_snack', 32),
    ('mi-diet-sub-kidney-diet', 'prescription_food', 'kidney_diet', 50),
    ('mi-diet-sub-training-snack', 'snack', 'training_snack', 61)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, key, parent_id, sort_order, is_active, metadata, created_at, updated_at
)
SELECT
  l2.id,
  c2.id,
  l2.key,
  p.id,
  l2.sort_order,
  1,
  '{}',
  datetime('now'),
  datetime('now')
FROM l2
JOIN master_categories c2 ON c2.key = 'diet_subtype'
JOIN master_items p
  ON p.key = l2.parent_l1_key
 AND p.category_id = (SELECT id FROM master_categories WHERE key = 'diet_type' LIMIT 1);

-- ---------------------------------------------------------------------------
-- A) Ensure required diet_feed_type L3 keys exist
-- ---------------------------------------------------------------------------
WITH l3(id, parent_l2_key, item_key, sort_order) AS (
  VALUES
    ('mi-diet-feed-dry-food-core', 'adult_dry_food', 'dry_food_core', 9001),
    ('mi-diet-feed-wet-food-core', 'canned_food', 'wet_food_core', 9002),
    ('mi-diet-feed-raw-food-core', 'raw_meat', 'raw_food_core', 9003),
    ('mi-diet-feed-freeze-dried-complete-core', 'freeze_dried_complete', 'freeze_dried_complete_core', 9004),
    ('mi-diet-feed-freeze-dried-snack-core', 'freeze_dried_snack', 'freeze_dried_snack_core', 9005),
    ('mi-diet-feed-prescription-diet-core', 'kidney_diet', 'prescription_diet_core', 9006),
    ('mi-diet-feed-snack-treat-core', 'training_snack', 'snack_treat_core', 9007)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, key, parent_id, sort_order, is_active, metadata, created_at, updated_at
)
SELECT
  l3.id,
  c3.id,
  l3.item_key,
  p.id,
  l3.sort_order,
  1,
  '{}',
  datetime('now'),
  datetime('now')
FROM l3
JOIN master_categories c3 ON c3.key IN ('diet_feed_type', 'master.diet_feed_type')
JOIN master_items p
  ON p.key = l3.parent_l2_key
 AND p.category_id = (
   SELECT id FROM master_categories WHERE key IN ('diet_subtype', 'master.diet_subtype') LIMIT 1
 );

WITH t(key, ko, en) AS (
  VALUES
    ('master.diet_feed_type.dry_food_core', '건식사료 코어', 'Dry Food Core'),
    ('master.diet_feed_type.wet_food_core', '습식사료 코어', 'Wet Food Core'),
    ('master.diet_feed_type.raw_food_core', '생식 코어', 'Raw Food Core'),
    ('master.diet_feed_type.freeze_dried_complete_core', '동결건조 완전식 코어', 'Freeze-dried Complete Core'),
    ('master.diet_feed_type.freeze_dried_snack_core', '동결건조 간식 코어', 'Freeze-dried Snack Core'),
    ('master.diet_feed_type.prescription_diet_core', '처방식 코어', 'Prescription Diet Core'),
    ('master.diet_feed_type.snack_treat_core', '간식 코어', 'Snack & Treat Core')
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
  t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en) AS (
  VALUES
    ('master.diet_feed_type.dry_food_core', '건식사료 코어', 'Dry Food Core'),
    ('master.diet_feed_type.wet_food_core', '습식사료 코어', 'Wet Food Core'),
    ('master.diet_feed_type.raw_food_core', '생식 코어', 'Raw Food Core'),
    ('master.diet_feed_type.freeze_dried_complete_core', '동결건조 완전식 코어', 'Freeze-dried Complete Core'),
    ('master.diet_feed_type.freeze_dried_snack_core', '동결건조 간식 코어', 'Freeze-dried Snack Core'),
    ('master.diet_feed_type.prescription_diet_core', '처방식 코어', 'Prescription Diet Core'),
    ('master.diet_feed_type.snack_treat_core', '간식 코어', 'Snack & Treat Core')
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

-- ---------------------------------------------------------------------------
-- B) Feed catalog core seed (F1/F2/F3)
-- ---------------------------------------------------------------------------
WITH seed_mfr(key, name_key, name_ko, name_en, country, sort_order) AS (
  VALUES
    ('royal_canin', 'feed.manufacturer.royal_canin', '로얄캐닌', 'Royal Canin', 'FR', 1),
    ('hills', 'feed.manufacturer.hills', '힐스', 'Hill''s', 'US', 2),
    ('orijen', 'feed.manufacturer.orijen', '오리젠', 'Orijen', 'CA', 3),
    ('acana', 'feed.manufacturer.acana', '아카나', 'Acana', 'CA', 4),
    ('ray_n_yvonne', 'feed.manufacturer.ray_n_yvonne', '레이앤이본', 'Ray & Yvonne', 'KR', 5)
)
INSERT OR IGNORE INTO feed_manufacturers (
  id, key, name_key, name_ko, name_en, country, status, sort_order, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  s.key,
  s.name_key,
  s.name_ko,
  s.name_en,
  s.country,
  'active',
  s.sort_order,
  datetime('now'),
  datetime('now')
FROM seed_mfr s;

WITH seed_mfr(key, name_key, name_ko, name_en, country, sort_order) AS (
  VALUES
    ('royal_canin', 'feed.manufacturer.royal_canin', '로얄캐닌', 'Royal Canin', 'FR', 1),
    ('hills', 'feed.manufacturer.hills', '힐스', 'Hill''s', 'US', 2),
    ('orijen', 'feed.manufacturer.orijen', '오리젠', 'Orijen', 'CA', 3),
    ('acana', 'feed.manufacturer.acana', '아카나', 'Acana', 'CA', 4),
    ('ray_n_yvonne', 'feed.manufacturer.ray_n_yvonne', '레이앤이본', 'Ray & Yvonne', 'KR', 5)
)
UPDATE feed_manufacturers
SET
  name_key = (SELECT s.name_key FROM seed_mfr s WHERE s.key = feed_manufacturers.key),
  name_ko = (SELECT s.name_ko FROM seed_mfr s WHERE s.key = feed_manufacturers.key),
  name_en = (SELECT s.name_en FROM seed_mfr s WHERE s.key = feed_manufacturers.key),
  country = (SELECT s.country FROM seed_mfr s WHERE s.key = feed_manufacturers.key),
  status = 'active',
  sort_order = (SELECT s.sort_order FROM seed_mfr s WHERE s.key = feed_manufacturers.key),
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM seed_mfr);

WITH seed_mfr_type(mfr_key, feed_type_code) AS (
  VALUES
    ('royal_canin', 'dry_food_core'),
    ('royal_canin', 'wet_food_core'),
    ('royal_canin', 'prescription_diet_core'),
    ('hills', 'dry_food_core'),
    ('hills', 'wet_food_core'),
    ('hills', 'prescription_diet_core'),
    ('orijen', 'dry_food_core'),
    ('orijen', 'wet_food_core'),
    ('orijen', 'freeze_dried_complete_core'),
    ('acana', 'dry_food_core'),
    ('acana', 'wet_food_core'),
    ('acana', 'freeze_dried_complete_core'),
    ('ray_n_yvonne', 'raw_food_core'),
    ('ray_n_yvonne', 'wet_food_core'),
    ('ray_n_yvonne', 'prescription_diet_core'),
    ('ray_n_yvonne', 'snack_treat_core')
)
INSERT OR IGNORE INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  mi.id,
  datetime('now')
FROM seed_mfr_type smt
JOIN feed_manufacturers m ON m.key = smt.mfr_key
JOIN master_items mi
  ON mi.key = smt.feed_type_code
 AND mi.category_id = (
   SELECT id FROM master_categories WHERE key IN ('diet_feed_type', 'master.diet_feed_type') LIMIT 1
 );

WITH seed_brand(key, mfr_key, name_key, name_ko, name_en) AS (
  VALUES
    ('royal_canin_size_health_nutrition_line', 'royal_canin', 'feed.brand.royal_canin_size_health_nutrition_line', '사이즈 헬스 뉴트리션', 'Size Health Nutrition'),
    ('royal_canin_feline_health_nutrition_line', 'royal_canin', 'feed.brand.royal_canin_feline_health_nutrition_line', '펠라인 헬스 뉴트리션', 'Feline Health Nutrition'),
    ('royal_canin_veterinary_diet_line', 'royal_canin', 'feed.brand.royal_canin_veterinary_diet_line', '베터리너리 다이어트', 'Veterinary Diet'),
    ('hills_science_diet_line', 'hills', 'feed.brand.hills_science_diet_line', '사이언스 다이어트', 'Science Diet'),
    ('hills_prescription_diet_line', 'hills', 'feed.brand.hills_prescription_diet_line', '프리스크립션 다이어트', 'Prescription Diet'),
    ('orijen_dry_line', 'orijen', 'feed.brand.orijen_dry_line', '오리젠 드라이 라인', 'Orijen Dry Line'),
    ('acana_wholesome_grains_line', 'acana', 'feed.brand.acana_wholesome_grains_line', '홀섬 그레인 라인', 'Wholesome Grains'),
    ('ray_yvonne_raw_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_raw_line', '레이앤이본 생식', 'Ray & Yvonne Raw'),
    ('ray_yvonne_cooked_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_cooked_line', '레이앤이본 조리식', 'Ray & Yvonne Cooked'),
    ('ray_yvonne_management_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_management_line', '레이앤이본 관리식', 'Ray & Yvonne Care')
)
INSERT OR IGNORE INTO feed_brands (
  id, manufacturer_id, name_key, name_ko, name_en, status, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  s.name_key,
  s.name_ko,
  s.name_en,
  'active',
  datetime('now'),
  datetime('now')
FROM seed_brand s
JOIN feed_manufacturers m ON m.key = s.mfr_key;

WITH seed_brand(key, mfr_key, name_key, name_ko, name_en) AS (
  VALUES
    ('royal_canin_size_health_nutrition_line', 'royal_canin', 'feed.brand.royal_canin_size_health_nutrition_line', '사이즈 헬스 뉴트리션', 'Size Health Nutrition'),
    ('royal_canin_feline_health_nutrition_line', 'royal_canin', 'feed.brand.royal_canin_feline_health_nutrition_line', '펠라인 헬스 뉴트리션', 'Feline Health Nutrition'),
    ('royal_canin_veterinary_diet_line', 'royal_canin', 'feed.brand.royal_canin_veterinary_diet_line', '베터리너리 다이어트', 'Veterinary Diet'),
    ('hills_science_diet_line', 'hills', 'feed.brand.hills_science_diet_line', '사이언스 다이어트', 'Science Diet'),
    ('hills_prescription_diet_line', 'hills', 'feed.brand.hills_prescription_diet_line', '프리스크립션 다이어트', 'Prescription Diet'),
    ('orijen_dry_line', 'orijen', 'feed.brand.orijen_dry_line', '오리젠 드라이 라인', 'Orijen Dry Line'),
    ('acana_wholesome_grains_line', 'acana', 'feed.brand.acana_wholesome_grains_line', '홀섬 그레인 라인', 'Wholesome Grains'),
    ('ray_yvonne_raw_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_raw_line', '레이앤이본 생식', 'Ray & Yvonne Raw'),
    ('ray_yvonne_cooked_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_cooked_line', '레이앤이본 조리식', 'Ray & Yvonne Cooked'),
    ('ray_yvonne_management_line', 'ray_n_yvonne', 'feed.brand.ray_yvonne_management_line', '레이앤이본 관리식', 'Ray & Yvonne Care')
)
UPDATE feed_brands
SET
  manufacturer_id = (
    SELECT m.id
    FROM seed_brand s
    JOIN feed_manufacturers m ON m.key = s.mfr_key
    WHERE s.name_key = feed_brands.name_key
  ),
  name_ko = (
    SELECT s.name_ko
    FROM seed_brand s
    WHERE s.name_key = feed_brands.name_key
  ),
  name_en = (
    SELECT s.name_en
    FROM seed_brand s
    WHERE s.name_key = feed_brands.name_key
  ),
  status = 'active',
  updated_at = datetime('now')
WHERE name_key IN (SELECT name_key FROM seed_brand);

WITH seed_brand_mfr(brand_key, mfr_key) AS (
  VALUES
    ('royal_canin_size_health_nutrition_line', 'royal_canin'),
    ('royal_canin_feline_health_nutrition_line', 'royal_canin'),
    ('royal_canin_veterinary_diet_line', 'royal_canin'),
    ('hills_science_diet_line', 'hills'),
    ('hills_prescription_diet_line', 'hills'),
    ('orijen_dry_line', 'orijen'),
    ('acana_wholesome_grains_line', 'acana'),
    ('ray_yvonne_raw_line', 'ray_n_yvonne'),
    ('ray_yvonne_cooked_line', 'ray_n_yvonne'),
    ('ray_yvonne_management_line', 'ray_n_yvonne')
)
INSERT OR IGNORE INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
SELECT
  lower(hex(randomblob(16))),
  b.id,
  m.id,
  datetime('now')
FROM seed_brand_mfr sbm
JOIN feed_brands b ON b.name_key = 'feed.brand.' || sbm.brand_key
JOIN feed_manufacturers m ON m.key = sbm.mfr_key;

WITH seed_model(
  key, feed_type_code, mfr_key, brand_key, name_key, model_name, model_code, description, sort_order
) AS (
  VALUES
    ('royal_canin_small_adult_dry_14lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_small_adult_dry_14lb', '로얄캐닌 스몰 어덜트 드라이 14lb', '', '{"package_weight_value":14,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 1),
    ('royal_canin_medium_adult_dry_30lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_medium_adult_dry_30lb', '로얄캐닌 미디엄 어덜트 드라이 30lb', '', '{"package_weight_value":30,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 2),
    ('royal_canin_indoor_adult_dry_cat_15lb', 'dry_food_core', 'royal_canin', 'royal_canin_feline_health_nutrition_line', 'feed.model.royal_canin_indoor_adult_dry_cat_15lb', '로얄캐닌 인도어 어덜트 고양이 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}', 3),
    ('royal_canin_large_adult_dry_40lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_large_adult_dry_40lb', '로얄캐닌 라지 어덜트 드라이 40lb', '', '{"package_weight_value":40,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 4),
    ('royal_canin_gastrointestinal_low_fat_dry_17_6lb', 'prescription_diet_core', 'royal_canin', 'royal_canin_veterinary_diet_line', 'feed.model.royal_canin_gastrointestinal_low_fat_dry_17_6lb', '로얄캐닌 위장관 저지방 드라이 17.6lb', '', '{"package_weight_value":17.6,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 5),

    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_chicken_barley_dry_45lb', '힐스 사이언스 다이어트 어덜트 치킨&보리 드라이 45lb', '', '{"package_weight_value":45,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 6),
    ('hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', '힐스 사이언스 다이어트 퍼피 치킨&브라운라이스 드라이 15.5lb', '', '{"package_weight_value":15.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 7),
    ('hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', '힐스 사이언스 다이어트 어덜트 스몰바이트 치킨&보리 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 8),
    ('hills_science_diet_adult_light_small_bites_dry_15lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_light_small_bites_dry_15lb', '힐스 사이언스 다이어트 어덜트 라이트 스몰바이트 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 9),
    ('hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', 'prescription_diet_core', 'hills', 'hills_prescription_diet_line', 'feed.model.hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', '힐스 프리스크립션 다이어트 c/d 멀티케어 유리너리+메타볼릭 드라이 24.5lb', '', '{"package_weight_value":24.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 10),

    ('orijen_original_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_original_dry_dog_23_5lb', '오리젠 오리지널 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 11),
    ('orijen_six_fish_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_six_fish_dry_dog_23_5lb', '오리젠 식스피쉬 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 12),
    ('orijen_regional_red_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_regional_red_dry_dog_23_5lb', '오리젠 리저널 레드 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 13),
    ('orijen_puppy_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_puppy_dry_dog_23_5lb', '오리젠 퍼피 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 14),
    ('orijen_cat_and_kitten_dry_cat_12lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_cat_and_kitten_dry_cat_12lb', '오리젠 캣앤키튼 드라이 캣 12lb', '', '{"package_weight_value":12,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"cat"}', 15),

    ('acana_wild_atlantic_dry_cat_10lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wild_atlantic_dry_cat_10lb', '아카나 와일드 애틀랜틱 드라이 캣 10lb', '', '{"package_weight_value":10,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"cat"}', 16),
    ('acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', '아카나 홀섬그레인 퍼피 씨앤팜 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 17),
    ('acana_wholesome_grains_large_breed_puppy_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_large_breed_puppy_dry_22_5lb', '아카나 홀섬그레인 라지브리드 퍼피 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 18),
    ('acana_wholesome_grains_large_breed_adult_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_large_breed_adult_dry_22_5lb', '아카나 홀섬그레인 라지브리드 어덜트 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 19),
    ('acana_wholesome_grains_red_meat_grains_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_red_meat_grains_dry_22_5lb', '아카나 홀섬그레인 레드미트 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 20),

    ('ray_yvonne_deer_eggshell_raw_9p', 'raw_food_core', 'ray_n_yvonne', 'ray_yvonne_raw_line', 'feed.model.ray_yvonne_deer_eggshell_raw_9p', '레이앤이본 사슴고기 난각 생식 9P', '', '{"package_weight_value":9,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 21),
    ('ray_yvonne_lamb_bone_raw_12p', 'raw_food_core', 'ray_n_yvonne', 'ray_yvonne_raw_line', 'feed.model.ray_yvonne_lamb_bone_raw_12p', '레이앤이본 뼈있는 양고기 생식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 22),
    ('ray_yvonne_beef_cooked_12p', 'wet_food_core', 'ray_n_yvonne', 'ray_yvonne_cooked_line', 'feed.model.ray_yvonne_beef_cooked_12p', '레이앤이본 소고기 요리 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 23),
    ('ray_yvonne_chicken_renal_care_12p', 'prescription_diet_core', 'ray_n_yvonne', 'ray_yvonne_management_line', 'feed.model.ray_yvonne_chicken_renal_care_12p', '레이앤이본 닭고기 신장관리식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 24),
    ('ray_yvonne_chicken_pancreas_care_12p', 'prescription_diet_core', 'ray_n_yvonne', 'ray_yvonne_management_line', 'feed.model.ray_yvonne_chicken_pancreas_care_12p', '레이앤이본 닭고기 췌장관리식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 25)
)
INSERT OR IGNORE INTO feed_models (
  id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, status, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.id,
  m.id,
  b.id,
  s.name_key,
  s.model_name,
  s.model_code,
  s.description,
  'active',
  datetime('now'),
  datetime('now')
FROM seed_model s
JOIN master_items t
  ON t.key = s.feed_type_code
 AND t.category_id = (
   SELECT id FROM master_categories WHERE key IN ('diet_feed_type', 'master.diet_feed_type') LIMIT 1
 )
JOIN feed_manufacturers m ON m.key = s.mfr_key
JOIN feed_brands b ON b.name_key = 'feed.brand.' || s.brand_key;

WITH seed_model(
  key, feed_type_code, mfr_key, brand_key, name_key, model_name, model_code, description, sort_order
) AS (
  VALUES
    ('royal_canin_small_adult_dry_14lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_small_adult_dry_14lb', '로얄캐닌 스몰 어덜트 드라이 14lb', '', '{"package_weight_value":14,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 1),
    ('royal_canin_medium_adult_dry_30lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_medium_adult_dry_30lb', '로얄캐닌 미디엄 어덜트 드라이 30lb', '', '{"package_weight_value":30,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 2),
    ('royal_canin_indoor_adult_dry_cat_15lb', 'dry_food_core', 'royal_canin', 'royal_canin_feline_health_nutrition_line', 'feed.model.royal_canin_indoor_adult_dry_cat_15lb', '로얄캐닌 인도어 어덜트 고양이 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"cat"}', 3),
    ('royal_canin_large_adult_dry_40lb', 'dry_food_core', 'royal_canin', 'royal_canin_size_health_nutrition_line', 'feed.model.royal_canin_large_adult_dry_40lb', '로얄캐닌 라지 어덜트 드라이 40lb', '', '{"package_weight_value":40,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 4),
    ('royal_canin_gastrointestinal_low_fat_dry_17_6lb', 'prescription_diet_core', 'royal_canin', 'royal_canin_veterinary_diet_line', 'feed.model.royal_canin_gastrointestinal_low_fat_dry_17_6lb', '로얄캐닌 위장관 저지방 드라이 17.6lb', '', '{"package_weight_value":17.6,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 5),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_chicken_barley_dry_45lb', '힐스 사이언스 다이어트 어덜트 치킨&보리 드라이 45lb', '', '{"package_weight_value":45,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 6),
    ('hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', '힐스 사이언스 다이어트 퍼피 치킨&브라운라이스 드라이 15.5lb', '', '{"package_weight_value":15.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 7),
    ('hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', '힐스 사이언스 다이어트 어덜트 스몰바이트 치킨&보리 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 8),
    ('hills_science_diet_adult_light_small_bites_dry_15lb', 'dry_food_core', 'hills', 'hills_science_diet_line', 'feed.model.hills_science_diet_adult_light_small_bites_dry_15lb', '힐스 사이언스 다이어트 어덜트 라이트 스몰바이트 드라이 15lb', '', '{"package_weight_value":15,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 9),
    ('hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', 'prescription_diet_core', 'hills', 'hills_prescription_diet_line', 'feed.model.hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', '힐스 프리스크립션 다이어트 c/d 멀티케어 유리너리+메타볼릭 드라이 24.5lb', '', '{"package_weight_value":24.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 10),
    ('orijen_original_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_original_dry_dog_23_5lb', '오리젠 오리지널 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 11),
    ('orijen_six_fish_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_six_fish_dry_dog_23_5lb', '오리젠 식스피쉬 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 12),
    ('orijen_regional_red_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_regional_red_dry_dog_23_5lb', '오리젠 리저널 레드 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 13),
    ('orijen_puppy_dry_dog_23_5lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_puppy_dry_dog_23_5lb', '오리젠 퍼피 드라이 독 23.5lb', '', '{"package_weight_value":23.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 14),
    ('orijen_cat_and_kitten_dry_cat_12lb', 'dry_food_core', 'orijen', 'orijen_dry_line', 'feed.model.orijen_cat_and_kitten_dry_cat_12lb', '오리젠 캣앤키튼 드라이 캣 12lb', '', '{"package_weight_value":12,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"cat"}', 15),
    ('acana_wild_atlantic_dry_cat_10lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wild_atlantic_dry_cat_10lb', '아카나 와일드 애틀랜틱 드라이 캣 10lb', '', '{"package_weight_value":10,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"cat"}', 16),
    ('acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', '아카나 홀섬그레인 퍼피 씨앤팜 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 17),
    ('acana_wholesome_grains_large_breed_puppy_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_large_breed_puppy_dry_22_5lb', '아카나 홀섬그레인 라지브리드 퍼피 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"puppy","species_key":"dog"}', 18),
    ('acana_wholesome_grains_large_breed_adult_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_large_breed_adult_dry_22_5lb', '아카나 홀섬그레인 라지브리드 어덜트 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"adult","species_key":"dog"}', 19),
    ('acana_wholesome_grains_red_meat_grains_dry_22_5lb', 'dry_food_core', 'acana', 'acana_wholesome_grains_line', 'feed.model.acana_wholesome_grains_red_meat_grains_dry_22_5lb', '아카나 홀섬그레인 레드미트 드라이 22.5lb', '', '{"package_weight_value":22.5,"package_weight_unit":"lb","life_stage_key":"all_life_stages","species_key":"dog"}', 20),
    ('ray_yvonne_deer_eggshell_raw_9p', 'raw_food_core', 'ray_n_yvonne', 'ray_yvonne_raw_line', 'feed.model.ray_yvonne_deer_eggshell_raw_9p', '레이앤이본 사슴고기 난각 생식 9P', '', '{"package_weight_value":9,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 21),
    ('ray_yvonne_lamb_bone_raw_12p', 'raw_food_core', 'ray_n_yvonne', 'ray_yvonne_raw_line', 'feed.model.ray_yvonne_lamb_bone_raw_12p', '레이앤이본 뼈있는 양고기 생식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 22),
    ('ray_yvonne_beef_cooked_12p', 'wet_food_core', 'ray_n_yvonne', 'ray_yvonne_cooked_line', 'feed.model.ray_yvonne_beef_cooked_12p', '레이앤이본 소고기 요리 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 23),
    ('ray_yvonne_chicken_renal_care_12p', 'prescription_diet_core', 'ray_n_yvonne', 'ray_yvonne_management_line', 'feed.model.ray_yvonne_chicken_renal_care_12p', '레이앤이본 닭고기 신장관리식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 24),
    ('ray_yvonne_chicken_pancreas_care_12p', 'prescription_diet_core', 'ray_n_yvonne', 'ray_yvonne_management_line', 'feed.model.ray_yvonne_chicken_pancreas_care_12p', '레이앤이본 닭고기 췌장관리식 12P', '', '{"package_weight_value":12,"package_weight_unit":"pack","life_stage_key":"adult","species_key":"dog"}', 25)
)
UPDATE feed_models
SET
  feed_type_item_id = (
    SELECT t.id
    FROM seed_model s
    JOIN master_items t
      ON t.key = s.feed_type_code
     AND t.category_id = (
       SELECT id FROM master_categories WHERE key IN ('diet_feed_type', 'master.diet_feed_type') LIMIT 1
     )
    WHERE s.name_key = feed_models.name_key
  ),
  manufacturer_id = (
    SELECT m.id
    FROM seed_model s
    JOIN feed_manufacturers m ON m.key = s.mfr_key
    WHERE s.name_key = feed_models.name_key
  ),
  brand_id = (
    SELECT b.id
    FROM seed_model s
    JOIN feed_brands b ON b.name_key = 'feed.brand.' || s.brand_key
    WHERE s.name_key = feed_models.name_key
  ),
  model_name = (
    SELECT s.model_name
    FROM seed_model s
    WHERE s.name_key = feed_models.name_key
  ),
  model_code = (
    SELECT s.model_code
    FROM seed_model s
    WHERE s.name_key = feed_models.name_key
  ),
  description = (
    SELECT s.description
    FROM seed_model s
    WHERE s.name_key = feed_models.name_key
  ),
  status = 'active',
  updated_at = datetime('now')
WHERE name_key IN (SELECT name_key FROM seed_model);

WITH seed_model_brand(model_key, brand_key) AS (
  VALUES
    ('royal_canin_small_adult_dry_14lb', 'royal_canin_size_health_nutrition_line'),
    ('royal_canin_medium_adult_dry_30lb', 'royal_canin_size_health_nutrition_line'),
    ('royal_canin_indoor_adult_dry_cat_15lb', 'royal_canin_feline_health_nutrition_line'),
    ('royal_canin_large_adult_dry_40lb', 'royal_canin_size_health_nutrition_line'),
    ('royal_canin_gastrointestinal_low_fat_dry_17_6lb', 'royal_canin_veterinary_diet_line'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'hills_science_diet_line'),
    ('hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', 'hills_science_diet_line'),
    ('hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', 'hills_science_diet_line'),
    ('hills_science_diet_adult_light_small_bites_dry_15lb', 'hills_science_diet_line'),
    ('hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', 'hills_prescription_diet_line'),
    ('orijen_original_dry_dog_23_5lb', 'orijen_dry_line'),
    ('orijen_six_fish_dry_dog_23_5lb', 'orijen_dry_line'),
    ('orijen_regional_red_dry_dog_23_5lb', 'orijen_dry_line'),
    ('orijen_puppy_dry_dog_23_5lb', 'orijen_dry_line'),
    ('orijen_cat_and_kitten_dry_cat_12lb', 'orijen_dry_line'),
    ('acana_wild_atlantic_dry_cat_10lb', 'acana_wholesome_grains_line'),
    ('acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', 'acana_wholesome_grains_line'),
    ('acana_wholesome_grains_large_breed_puppy_dry_22_5lb', 'acana_wholesome_grains_line'),
    ('acana_wholesome_grains_large_breed_adult_dry_22_5lb', 'acana_wholesome_grains_line'),
    ('acana_wholesome_grains_red_meat_grains_dry_22_5lb', 'acana_wholesome_grains_line'),
    ('ray_yvonne_deer_eggshell_raw_9p', 'ray_yvonne_raw_line'),
    ('ray_yvonne_lamb_bone_raw_12p', 'ray_yvonne_raw_line'),
    ('ray_yvonne_beef_cooked_12p', 'ray_yvonne_cooked_line'),
    ('ray_yvonne_chicken_renal_care_12p', 'ray_yvonne_management_line'),
    ('ray_yvonne_chicken_pancreas_care_12p', 'ray_yvonne_management_line')
)
INSERT OR IGNORE INTO feed_model_brand_map (id, model_id, brand_id, created_at)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  b.id,
  datetime('now')
FROM seed_model_brand smb
JOIN feed_models m ON m.name_key = 'feed.model.' || smb.model_key
JOIN feed_brands b ON b.name_key = 'feed.brand.' || smb.brand_key;

-- ---------------------------------------------------------------------------
-- C) i18n seed for feed manufacturer/brand/model
-- ---------------------------------------------------------------------------
WITH t(key, page, ko, en) AS (
  VALUES
    ('feed.manufacturer.royal_canin', 'feed', '로얄캐닌', 'Royal Canin'),
    ('feed.manufacturer.hills', 'feed', '힐스', 'Hill''s'),
    ('feed.manufacturer.orijen', 'feed', '오리젠', 'Orijen'),
    ('feed.manufacturer.acana', 'feed', '아카나', 'Acana'),
    ('feed.manufacturer.ray_n_yvonne', 'feed', '레이앤이본', 'Ray & Yvonne'),
    ('feed.brand.royal_canin_size_health_nutrition_line', 'feed', '사이즈 헬스 뉴트리션', 'Size Health Nutrition'),
    ('feed.brand.royal_canin_feline_health_nutrition_line', 'feed', '펠라인 헬스 뉴트리션', 'Feline Health Nutrition'),
    ('feed.brand.royal_canin_veterinary_diet_line', 'feed', '베터리너리 다이어트', 'Veterinary Diet'),
    ('feed.brand.hills_science_diet_line', 'feed', '사이언스 다이어트', 'Science Diet'),
    ('feed.brand.hills_prescription_diet_line', 'feed', '프리스크립션 다이어트', 'Prescription Diet'),
    ('feed.brand.orijen_dry_line', 'feed', '오리젠 드라이 라인', 'Orijen Dry Line'),
    ('feed.brand.acana_wholesome_grains_line', 'feed', '홀섬 그레인 라인', 'Wholesome Grains'),
    ('feed.brand.ray_yvonne_raw_line', 'feed', '레이앤이본 생식', 'Ray & Yvonne Raw'),
    ('feed.brand.ray_yvonne_cooked_line', 'feed', '레이앤이본 조리식', 'Ray & Yvonne Cooked'),
    ('feed.brand.ray_yvonne_management_line', 'feed', '레이앤이본 관리식', 'Ray & Yvonne Care')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.page,
  t.ko,
  t.en,
  t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, page, ko, en) AS (
  VALUES
    ('feed.manufacturer.royal_canin', 'feed', '로얄캐닌', 'Royal Canin'),
    ('feed.manufacturer.hills', 'feed', '힐스', 'Hill''s'),
    ('feed.manufacturer.orijen', 'feed', '오리젠', 'Orijen'),
    ('feed.manufacturer.acana', 'feed', '아카나', 'Acana'),
    ('feed.manufacturer.ray_n_yvonne', 'feed', '레이앤이본', 'Ray & Yvonne'),
    ('feed.brand.royal_canin_size_health_nutrition_line', 'feed', '사이즈 헬스 뉴트리션', 'Size Health Nutrition'),
    ('feed.brand.royal_canin_feline_health_nutrition_line', 'feed', '펠라인 헬스 뉴트리션', 'Feline Health Nutrition'),
    ('feed.brand.royal_canin_veterinary_diet_line', 'feed', '베터리너리 다이어트', 'Veterinary Diet'),
    ('feed.brand.hills_science_diet_line', 'feed', '사이언스 다이어트', 'Science Diet'),
    ('feed.brand.hills_prescription_diet_line', 'feed', '프리스크립션 다이어트', 'Prescription Diet'),
    ('feed.brand.orijen_dry_line', 'feed', '오리젠 드라이 라인', 'Orijen Dry Line'),
    ('feed.brand.acana_wholesome_grains_line', 'feed', '홀섬 그레인 라인', 'Wholesome Grains'),
    ('feed.brand.ray_yvonne_raw_line', 'feed', '레이앤이본 생식', 'Ray & Yvonne Raw'),
    ('feed.brand.ray_yvonne_cooked_line', 'feed', '레이앤이본 조리식', 'Ray & Yvonne Cooked'),
    ('feed.brand.ray_yvonne_management_line', 'feed', '레이앤이본 관리식', 'Ray & Yvonne Care')
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

WITH t(key, page, ko, en) AS (
  VALUES
    ('feed.model.royal_canin_small_adult_dry_14lb', 'feed', '로얄캐닌 스몰 어덜트 드라이 14lb', 'Royal Canin Small Adult Dry 14lb'),
    ('feed.model.royal_canin_medium_adult_dry_30lb', 'feed', '로얄캐닌 미디엄 어덜트 드라이 30lb', 'Royal Canin Medium Adult Dry 30lb'),
    ('feed.model.royal_canin_indoor_adult_dry_cat_15lb', 'feed', '로얄캐닌 인도어 어덜트 고양이 드라이 15lb', 'Royal Canin Indoor Adult Dry Cat 15lb'),
    ('feed.model.royal_canin_large_adult_dry_40lb', 'feed', '로얄캐닌 라지 어덜트 드라이 40lb', 'Royal Canin Large Adult Dry 40lb'),
    ('feed.model.royal_canin_gastrointestinal_low_fat_dry_17_6lb', 'feed', '로얄캐닌 위장관 저지방 드라이 17.6lb', 'Royal Canin Gastrointestinal Low Fat Dry 17.6lb'),
    ('feed.model.hills_science_diet_adult_chicken_barley_dry_45lb', 'feed', '힐스 사이언스 다이어트 어덜트 치킨&보리 드라이 45lb', 'Hill''s Science Diet Adult Chicken & Barley Dry 45lb'),
    ('feed.model.hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', 'feed', '힐스 사이언스 다이어트 퍼피 치킨&브라운라이스 드라이 15.5lb', 'Hill''s Science Diet Puppy Chicken & Brown Rice Dry 15.5lb'),
    ('feed.model.hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', 'feed', '힐스 사이언스 다이어트 어덜트 스몰바이트 치킨&보리 드라이 15lb', 'Hill''s Science Diet Adult Small Bites Chicken & Barley Dry 15lb'),
    ('feed.model.hills_science_diet_adult_light_small_bites_dry_15lb', 'feed', '힐스 사이언스 다이어트 어덜트 라이트 스몰바이트 드라이 15lb', 'Hill''s Science Diet Adult Light Small Bites Dry 15lb'),
    ('feed.model.hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', 'feed', '힐스 프리스크립션 다이어트 c/d 멀티케어 유리너리+메타볼릭 드라이 24.5lb', 'Hill''s Prescription Diet c/d Multicare Urinary+Metabolic Dry 24.5lb'),
    ('feed.model.orijen_original_dry_dog_23_5lb', 'feed', '오리젠 오리지널 드라이 독 23.5lb', 'Orijen Original Dry Dog 23.5lb'),
    ('feed.model.orijen_six_fish_dry_dog_23_5lb', 'feed', '오리젠 식스피쉬 드라이 독 23.5lb', 'Orijen Six Fish Dry Dog 23.5lb'),
    ('feed.model.orijen_regional_red_dry_dog_23_5lb', 'feed', '오리젠 리저널 레드 드라이 독 23.5lb', 'Orijen Regional Red Dry Dog 23.5lb'),
    ('feed.model.orijen_puppy_dry_dog_23_5lb', 'feed', '오리젠 퍼피 드라이 독 23.5lb', 'Orijen Puppy Dry Dog 23.5lb'),
    ('feed.model.orijen_cat_and_kitten_dry_cat_12lb', 'feed', '오리젠 캣앤키튼 드라이 캣 12lb', 'Orijen Cat & Kitten Dry Cat 12lb'),
    ('feed.model.acana_wild_atlantic_dry_cat_10lb', 'feed', '아카나 와일드 애틀랜틱 드라이 캣 10lb', 'Acana Wild Atlantic Dry Cat 10lb'),
    ('feed.model.acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', 'feed', '아카나 홀섬그레인 퍼피 씨앤팜 드라이 22.5lb', 'Acana Wholesome Grains Puppy Sea & Farm Dry 22.5lb'),
    ('feed.model.acana_wholesome_grains_large_breed_puppy_dry_22_5lb', 'feed', '아카나 홀섬그레인 라지브리드 퍼피 드라이 22.5lb', 'Acana Wholesome Grains Large Breed Puppy Dry 22.5lb'),
    ('feed.model.acana_wholesome_grains_large_breed_adult_dry_22_5lb', 'feed', '아카나 홀섬그레인 라지브리드 어덜트 드라이 22.5lb', 'Acana Wholesome Grains Large Breed Adult Dry 22.5lb'),
    ('feed.model.acana_wholesome_grains_red_meat_grains_dry_22_5lb', 'feed', '아카나 홀섬그레인 레드미트 드라이 22.5lb', 'Acana Wholesome Grains Red Meat Dry 22.5lb'),
    ('feed.model.ray_yvonne_deer_eggshell_raw_9p', 'feed', '레이앤이본 사슴고기 난각 생식 9P', 'Ray & Yvonne Venison Eggshell Raw 9P'),
    ('feed.model.ray_yvonne_lamb_bone_raw_12p', 'feed', '레이앤이본 뼈있는 양고기 생식 12P', 'Ray & Yvonne Lamb Bone Raw 12P'),
    ('feed.model.ray_yvonne_beef_cooked_12p', 'feed', '레이앤이본 소고기 요리 12P', 'Ray & Yvonne Beef Cooked 12P'),
    ('feed.model.ray_yvonne_chicken_renal_care_12p', 'feed', '레이앤이본 닭고기 신장관리식 12P', 'Ray & Yvonne Chicken Renal Care 12P'),
    ('feed.model.ray_yvonne_chicken_pancreas_care_12p', 'feed', '레이앤이본 닭고기 췌장관리식 12P', 'Ray & Yvonne Chicken Pancreas Care 12P')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.page,
  t.ko,
  t.en,
  t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

-- ---------------------------------------------------------------------------
-- D) Nutrient master and model nutrients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_nutrient_types (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_nutrition_units (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  symbol       TEXT,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_nutrition_basis_types (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_model_nutrients (
  id               TEXT PRIMARY KEY,
  model_id         TEXT NOT NULL REFERENCES feed_models(id),
  nutrient_type_id TEXT NOT NULL REFERENCES feed_nutrient_types(id),
  basis_type_id    TEXT NOT NULL REFERENCES feed_nutrition_basis_types(id),
  value            REAL NOT NULL,
  unit_id          TEXT NOT NULL REFERENCES feed_nutrition_units(id),
  source_note      TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  UNIQUE(model_id, nutrient_type_id, basis_type_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_model_nutrients_model ON feed_model_nutrients(model_id);
CREATE INDEX IF NOT EXISTS idx_feed_model_nutrients_nutrient ON feed_model_nutrients(nutrient_type_id);

WITH t(key, name_key, ko, en, sort_order) AS (
  VALUES
    ('energy', 'feed.nutrient.energy', '에너지', 'Energy', 1),
    ('moisture', 'feed.nutrient.moisture', '수분', 'Moisture', 2),
    ('crude_protein', 'feed.nutrient.crude_protein', '조단백', 'Crude Protein', 3),
    ('crude_fat', 'feed.nutrient.crude_fat', '조지방', 'Crude Fat', 4),
    ('crude_fiber', 'feed.nutrient.crude_fiber', '조섬유', 'Crude Fiber', 5),
    ('crude_ash', 'feed.nutrient.crude_ash', '조회분', 'Crude Ash', 6),
    ('calcium', 'feed.nutrient.calcium', '칼슘', 'Calcium', 7),
    ('phosphorus', 'feed.nutrient.phosphorus', '인', 'Phosphorus', 8),
    ('magnesium', 'feed.nutrient.magnesium', '마그네슘', 'Magnesium', 9),
    ('sodium', 'feed.nutrient.sodium', '나트륨', 'Sodium', 10),
    ('potassium', 'feed.nutrient.potassium', '칼륨', 'Potassium', 11),
    ('taurine', 'feed.nutrient.taurine', '타우린', 'Taurine', 12),
    ('vitamin_d', 'feed.nutrient.vitamin_d', '비타민D', 'Vitamin D', 13),
    ('vitamin_e_alpha', 'feed.nutrient.vitamin_e_alpha', '비타민E', 'Vitamin E', 14),
    ('omega3', 'feed.nutrient.omega3', '오메가3', 'Omega-3', 15),
    ('omega6', 'feed.nutrient.omega6', '오메가6', 'Omega-6', 16),
    ('epa_dha', 'feed.nutrient.epa_dha', 'EPA+DHA', 'EPA + DHA', 17),
    ('epa', 'feed.nutrient.epa', 'EPA', 'EPA', 18),
    ('dha', 'feed.nutrient.dha', 'DHA', 'DHA', 19)
)
INSERT OR IGNORE INTO feed_nutrient_types (
  id, key, name_key, name_ko, name_en, status, sort_order, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.name_key,
  t.ko,
  t.en,
  'active',
  t.sort_order,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, name_key, ko, en, symbol, sort_order) AS (
  VALUES
    ('kcal', 'feed.nutrient.unit.kcal', '킬로칼로리', 'Kilocalorie', 'kcal', 1),
    ('percent', 'feed.nutrient.unit.percent', '퍼센트', 'Percent', '%', 2),
    ('g', 'feed.nutrient.unit.g', '그램', 'Gram', 'g', 3),
    ('mg', 'feed.nutrient.unit.mg', '밀리그램', 'Milligram', 'mg', 4),
    ('ug', 'feed.nutrient.unit.ug', '마이크로그램', 'Microgram', 'ug', 5),
    ('iu', 'feed.nutrient.unit.iu', '국제단위', 'International Unit', 'IU', 6)
)
INSERT OR IGNORE INTO feed_nutrition_units (
  id, key, name_key, name_ko, name_en, symbol, status, sort_order, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.name_key,
  t.ko,
  t.en,
  t.symbol,
  'active',
  t.sort_order,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, name_key, ko, en, sort_order) AS (
  VALUES
    ('as_fed', 'feed.nutrient.basis.as_fed', '급여기준', 'As Fed', 1),
    ('dry_matter', 'feed.nutrient.basis.dry_matter', '건물기준', 'Dry Matter', 2),
    ('per_100g', 'feed.nutrient.basis.per_100g', '100g당', 'Per 100g', 3),
    ('per_serving', 'feed.nutrient.basis.per_serving', '1회급여당', 'Per Serving', 4)
)
INSERT OR IGNORE INTO feed_nutrition_basis_types (
  id, key, name_key, name_ko, name_en, status, sort_order, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.name_key,
  t.ko,
  t.en,
  'active',
  t.sort_order,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, page, ko, en) AS (
  VALUES
    ('feed.nutrient.energy', 'feed', '에너지', 'Energy'),
    ('feed.nutrient.moisture', 'feed', '수분', 'Moisture'),
    ('feed.nutrient.crude_protein', 'feed', '조단백', 'Crude Protein'),
    ('feed.nutrient.crude_fat', 'feed', '조지방', 'Crude Fat'),
    ('feed.nutrient.crude_fiber', 'feed', '조섬유', 'Crude Fiber'),
    ('feed.nutrient.crude_ash', 'feed', '조회분', 'Crude Ash'),
    ('feed.nutrient.calcium', 'feed', '칼슘', 'Calcium'),
    ('feed.nutrient.phosphorus', 'feed', '인', 'Phosphorus'),
    ('feed.nutrient.magnesium', 'feed', '마그네슘', 'Magnesium'),
    ('feed.nutrient.sodium', 'feed', '나트륨', 'Sodium'),
    ('feed.nutrient.potassium', 'feed', '칼륨', 'Potassium'),
    ('feed.nutrient.taurine', 'feed', '타우린', 'Taurine'),
    ('feed.nutrient.vitamin_d', 'feed', '비타민D', 'Vitamin D'),
    ('feed.nutrient.vitamin_e_alpha', 'feed', '비타민E', 'Vitamin E'),
    ('feed.nutrient.omega3', 'feed', '오메가3', 'Omega-3'),
    ('feed.nutrient.omega6', 'feed', '오메가6', 'Omega-6'),
    ('feed.nutrient.epa_dha', 'feed', 'EPA+DHA', 'EPA + DHA'),
    ('feed.nutrient.epa', 'feed', 'EPA', 'EPA'),
    ('feed.nutrient.dha', 'feed', 'DHA', 'DHA'),
    ('feed.nutrient.unit.kcal', 'feed', '킬로칼로리', 'Kilocalorie'),
    ('feed.nutrient.unit.percent', 'feed', '퍼센트', 'Percent'),
    ('feed.nutrient.unit.g', 'feed', '그램', 'Gram'),
    ('feed.nutrient.unit.mg', 'feed', '밀리그램', 'Milligram'),
    ('feed.nutrient.unit.ug', 'feed', '마이크로그램', 'Microgram'),
    ('feed.nutrient.unit.iu', 'feed', '국제단위', 'International Unit'),
    ('feed.nutrient.basis.as_fed', 'feed', '급여기준', 'As Fed'),
    ('feed.nutrient.basis.dry_matter', 'feed', '건물기준', 'Dry Matter'),
    ('feed.nutrient.basis.per_100g', 'feed', '100g당', 'Per 100g'),
    ('feed.nutrient.basis.per_serving', 'feed', '1회급여당', 'Per Serving')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.page,
  t.ko,
  t.en,
  t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH seed_nutr(model_key, nutrient_key, basis_key, value, unit_key, source_note) AS (
  VALUES
    ('royal_canin_small_adult_dry_14lb', 'crude_protein', 'as_fed', 25.0, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'crude_fat', 'as_fed', 14.0, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'crude_fiber', 'as_fed', 3.4, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'moisture', 'as_fed', 10.0, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'epa', 'as_fed', 0.11, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'dha', 'as_fed', 0.05, 'percent', 'official'),
    ('royal_canin_small_adult_dry_14lb', 'energy', 'per_100g', 374.4, 'kcal', 'official'),

    ('royal_canin_medium_adult_dry_30lb', 'crude_protein', 'as_fed', 23.0, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'crude_fat', 'as_fed', 12.0, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'crude_fiber', 'as_fed', 3.4, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'moisture', 'as_fed', 10.5, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'calcium', 'as_fed', 0.85, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'phosphorus', 'as_fed', 0.56, 'percent', 'official'),
    ('royal_canin_medium_adult_dry_30lb', 'energy', 'per_100g', 361.6, 'kcal', 'official'),

    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_protein', 'as_fed', 23.8, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_fat', 'as_fed', 15.0, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_fiber', 'as_fed', 1.7, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'calcium', 'as_fed', 0.8, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'phosphorus', 'as_fed', 0.69, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'omega3', 'as_fed', 0.61, 'percent', 'official'),
    ('hills_science_diet_adult_chicken_barley_dry_45lb', 'omega6', 'as_fed', 4.25, 'percent', 'official'),

    ('orijen_original_dry_dog_23_5lb', 'crude_protein', 'as_fed', 38.0, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'crude_fat', 'as_fed', 18.0, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'crude_fiber', 'as_fed', 4.0, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'moisture', 'as_fed', 12.0, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'dha', 'as_fed', 0.2, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'epa', 'as_fed', 0.2, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'calcium', 'as_fed', 1.2, 'percent', 'official'),
    ('orijen_original_dry_dog_23_5lb', 'phosphorus', 'as_fed', 1.0, 'percent', 'official'),

    ('acana_wild_atlantic_dry_cat_10lb', 'crude_protein', 'as_fed', 36.0, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'crude_fat', 'as_fed', 18.0, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'crude_fiber', 'as_fed', 4.0, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'moisture', 'as_fed', 10.0, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'epa', 'as_fed', 0.5, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'dha', 'as_fed', 0.6, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'calcium', 'as_fed', 1.4, 'percent', 'official'),
    ('acana_wild_atlantic_dry_cat_10lb', 'phosphorus', 'as_fed', 1.0, 'percent', 'official')
)
INSERT OR IGNORE INTO feed_model_nutrients (
  id, model_id, nutrient_type_id, basis_type_id, value, unit_id, source_note, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  m.id,
  nt.id,
  bt.id,
  s.value,
  u.id,
  s.source_note,
  datetime('now'),
  datetime('now')
FROM seed_nutr s
JOIN feed_models m ON m.name_key = 'feed.model.' || s.model_key
JOIN feed_nutrient_types nt ON nt.key = s.nutrient_key
JOIN feed_nutrition_basis_types bt ON bt.key = s.basis_key
JOIN feed_nutrition_units u ON u.key = s.unit_key;

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0057_feed_catalog_global_phase1_seed');
