-- global_feed_seed_phase1_2026-03-08.sql
-- Phase 1 brands: Royal Canin, Hill's, Orijen, Acana, Ray & Yvonne
-- Purpose: Insert-ready seed staging set for Food Management (F1/F2/F3 + nutrients)

BEGIN TRANSACTION;

-- =========================================================
-- 1) food_manufacturer_seed
-- =========================================================
CREATE TABLE IF NOT EXISTS food_manufacturer_seed (
  entity_type TEXT NOT NULL,
  key TEXT PRIMARY KEY,
  parent_feed_type_keys_json TEXT NOT NULL,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  country_code TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

INSERT OR REPLACE INTO food_manufacturer_seed (
  entity_type, key, parent_feed_type_keys_json, label_ko, auto_translate_from_ko, country_code, website_url, sort_order, is_active
) VALUES
  ('food_manufacturer', 'royal_canin', '["dry_food_core","wet_food_core","prescription_diet_core"]', '로얄캐닌', 1, 'FR', 'https://www.royalcanin.com', 1, 1),
  ('food_manufacturer', 'hills', '["dry_food_core","wet_food_core","prescription_diet_core"]', '힐스', 1, 'US', 'https://www.hillspet.com', 2, 1),
  ('food_manufacturer', 'orijen', '["dry_food_core","wet_food_core","freeze_dried_complete_core"]', '오리젠', 1, 'CA', 'https://www.orijenpetfoods.com', 3, 1),
  ('food_manufacturer', 'acana', '["dry_food_core","wet_food_core","freeze_dried_complete_core"]', '아카나', 1, 'CA', 'https://www.acana.com', 4, 1),
  ('food_manufacturer', 'ray_n_yvonne', '["raw_food_core","wet_food_core","prescription_diet_core","snack_treat_core"]', '레이앤이본', 1, 'KR', 'https://www.knrc.co.kr/shop/', 5, 1);

-- =========================================================
-- 2) food_brand_seed
-- =========================================================
CREATE TABLE IF NOT EXISTS food_brand_seed (
  entity_type TEXT NOT NULL,
  key TEXT PRIMARY KEY,
  parent_manufacturer_keys_json TEXT NOT NULL,
  parent_feed_type_keys_json TEXT NOT NULL,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

INSERT OR REPLACE INTO food_brand_seed (
  entity_type, key, parent_manufacturer_keys_json, parent_feed_type_keys_json, label_ko, auto_translate_from_ko, sort_order, is_active
) VALUES
  ('food_brand', 'royal_canin_size_health_nutrition_line', '["royal_canin"]', '["dry_food_core"]', '사이즈 헬스 뉴트리션', 1, 1, 1),
  ('food_brand', 'royal_canin_feline_health_nutrition_line', '["royal_canin"]', '["dry_food_core"]', '펠라인 헬스 뉴트리션', 1, 2, 1),
  ('food_brand', 'royal_canin_veterinary_diet_line', '["royal_canin"]', '["prescription_diet_core"]', '베터리너리 다이어트', 1, 3, 1),
  ('food_brand', 'hills_science_diet_line', '["hills"]', '["dry_food_core"]', '사이언스 다이어트', 1, 4, 1),
  ('food_brand', 'hills_prescription_diet_line', '["hills"]', '["prescription_diet_core"]', '프리스크립션 다이어트', 1, 5, 1),
  ('food_brand', 'orijen_dry_line', '["orijen"]', '["dry_food_core"]', '오리젠 드라이 라인', 1, 6, 1),
  ('food_brand', 'acana_wholesome_grains_line', '["acana"]', '["dry_food_core"]', '홀섬 그레인 라인', 1, 7, 1),
  ('food_brand', 'ray_yvonne_raw_line', '["ray_n_yvonne"]', '["raw_food_core"]', '레이앤이본 생식', 1, 8, 1),
  ('food_brand', 'ray_yvonne_cooked_line', '["ray_n_yvonne"]', '["wet_food_core"]', '레이앤이본 조리식', 1, 9, 1),
  ('food_brand', 'ray_yvonne_management_line', '["ray_n_yvonne"]', '["prescription_diet_core"]', '레이앤이본 관리식', 1, 10, 1);

-- =========================================================
-- 3) food_model_seed
-- =========================================================
CREATE TABLE IF NOT EXISTS food_model_seed (
  entity_type TEXT NOT NULL,
  key TEXT PRIMARY KEY,
  parent_manufacturer_keys_json TEXT NOT NULL,
  parent_brand_keys_json TEXT NOT NULL,
  parent_feed_type_keys_json TEXT NOT NULL,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  sku_code TEXT,
  barcode TEXT,
  package_weight_value REAL NOT NULL,
  package_weight_unit TEXT NOT NULL,
  life_stage_key TEXT,
  species_key TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL
);

INSERT OR REPLACE INTO food_model_seed (
  entity_type, key, parent_manufacturer_keys_json, parent_brand_keys_json, parent_feed_type_keys_json,
  label_ko, auto_translate_from_ko, sku_code, barcode, package_weight_value, package_weight_unit,
  life_stage_key, species_key, is_active, sort_order
) VALUES
  ('food_model', 'royal_canin_small_adult_dry_14lb', '["royal_canin"]', '["royal_canin_size_health_nutrition_line"]', '["dry_food_core"]', '로얄캐닌 스몰 어덜트 드라이 14lb', 1, '', '', 14, 'lb', 'adult', 'dog', 1, 1),
  ('food_model', 'royal_canin_medium_adult_dry_30lb', '["royal_canin"]', '["royal_canin_size_health_nutrition_line"]', '["dry_food_core"]', '로얄캐닌 미디엄 어덜트 드라이 30lb', 1, '', '', 30, 'lb', 'adult', 'dog', 1, 2),
  ('food_model', 'royal_canin_indoor_adult_dry_cat_15lb', '["royal_canin"]', '["royal_canin_feline_health_nutrition_line"]', '["dry_food_core"]', '로얄캐닌 인도어 어덜트 고양이 드라이 15lb', 1, '', '', 15, 'lb', 'adult', 'cat', 1, 3),
  ('food_model', 'royal_canin_large_adult_dry_40lb', '["royal_canin"]', '["royal_canin_size_health_nutrition_line"]', '["dry_food_core"]', '로얄캐닌 라지 어덜트 드라이 40lb', 1, '', '', 40, 'lb', 'adult', 'dog', 1, 4),
  ('food_model', 'royal_canin_gastrointestinal_low_fat_dry_17_6lb', '["royal_canin"]', '["royal_canin_veterinary_diet_line"]', '["prescription_diet_core"]', '로얄캐닌 위장관 저지방 드라이 17.6lb', 1, '', '', 17.6, 'lb', 'adult', 'dog', 1, 5),

  ('food_model', 'hills_science_diet_adult_chicken_barley_dry_45lb', '["hills"]', '["hills_science_diet_line"]', '["dry_food_core"]', '힐스 사이언스 다이어트 어덜트 치킨&보리 드라이 45lb', 1, '', '', 45, 'lb', 'adult', 'dog', 1, 6),
  ('food_model', 'hills_science_diet_puppy_chicken_brown_rice_dry_15_5lb', '["hills"]', '["hills_science_diet_line"]', '["dry_food_core"]', '힐스 사이언스 다이어트 퍼피 치킨&브라운라이스 드라이 15.5lb', 1, '', '', 15.5, 'lb', 'puppy', 'dog', 1, 7),
  ('food_model', 'hills_science_diet_adult_small_bites_chicken_barley_dry_15lb', '["hills"]', '["hills_science_diet_line"]', '["dry_food_core"]', '힐스 사이언스 다이어트 어덜트 스몰바이트 치킨&보리 드라이 15lb', 1, '', '', 15, 'lb', 'adult', 'dog', 1, 8),
  ('food_model', 'hills_science_diet_adult_light_small_bites_dry_15lb', '["hills"]', '["hills_science_diet_line"]', '["dry_food_core"]', '힐스 사이언스 다이어트 어덜트 라이트 스몰바이트 드라이 15lb', 1, '', '', 15, 'lb', 'adult', 'dog', 1, 9),
  ('food_model', 'hills_prescription_diet_cd_multicare_urinary_metabolic_dry_24_5lb', '["hills"]', '["hills_prescription_diet_line"]', '["prescription_diet_core"]', '힐스 프리스크립션 다이어트 c/d 멀티케어 유리너리+메타볼릭 드라이 24.5lb', 1, '', '', 24.5, 'lb', 'adult', 'dog', 1, 10),

  ('food_model', 'orijen_original_dry_dog_23_5lb', '["orijen"]', '["orijen_dry_line"]', '["dry_food_core"]', '오리젠 오리지널 드라이 독 23.5lb', 1, '', '', 23.5, 'lb', 'all_life_stages', 'dog', 1, 11),
  ('food_model', 'orijen_six_fish_dry_dog_23_5lb', '["orijen"]', '["orijen_dry_line"]', '["dry_food_core"]', '오리젠 식스피쉬 드라이 독 23.5lb', 1, '', '', 23.5, 'lb', 'all_life_stages', 'dog', 1, 12),
  ('food_model', 'orijen_regional_red_dry_dog_23_5lb', '["orijen"]', '["orijen_dry_line"]', '["dry_food_core"]', '오리젠 리저널 레드 드라이 독 23.5lb', 1, '', '', 23.5, 'lb', 'all_life_stages', 'dog', 1, 13),
  ('food_model', 'orijen_puppy_dry_dog_23_5lb', '["orijen"]', '["orijen_dry_line"]', '["dry_food_core"]', '오리젠 퍼피 드라이 독 23.5lb', 1, '', '', 23.5, 'lb', 'puppy', 'dog', 1, 14),
  ('food_model', 'orijen_cat_and_kitten_dry_cat_12lb', '["orijen"]', '["orijen_dry_line"]', '["dry_food_core"]', '오리젠 캣앤키튼 드라이 캣 12lb', 1, '', '', 12, 'lb', 'all_life_stages', 'cat', 1, 15),

  ('food_model', 'acana_wild_atlantic_dry_cat_10lb', '["acana"]', '["acana_wholesome_grains_line"]', '["dry_food_core"]', '아카나 와일드 애틀랜틱 드라이 캣 10lb', 1, '', '', 10, 'lb', 'all_life_stages', 'cat', 1, 16),
  ('food_model', 'acana_wholesome_grains_puppy_sea_farm_dry_22_5lb', '["acana"]', '["acana_wholesome_grains_line"]', '["dry_food_core"]', '아카나 홀섬그레인 퍼피 씨앤팜 드라이 22.5lb', 1, '', '', 22.5, 'lb', 'puppy', 'dog', 1, 17),
  ('food_model', 'acana_wholesome_grains_large_breed_puppy_dry_22_5lb', '["acana"]', '["acana_wholesome_grains_line"]', '["dry_food_core"]', '아카나 홀섬그레인 라지브리드 퍼피 드라이 22.5lb', 1, '', '', 22.5, 'lb', 'puppy', 'dog', 1, 18),
  ('food_model', 'acana_wholesome_grains_large_breed_adult_dry_22_5lb', '["acana"]', '["acana_wholesome_grains_line"]', '["dry_food_core"]', '아카나 홀섬그레인 라지브리드 어덜트 드라이 22.5lb', 1, '', '', 22.5, 'lb', 'adult', 'dog', 1, 19),
  ('food_model', 'acana_wholesome_grains_red_meat_grains_dry_22_5lb', '["acana"]', '["acana_wholesome_grains_line"]', '["dry_food_core"]', '아카나 홀섬그레인 레드미트 드라이 22.5lb', 1, '', '', 22.5, 'lb', 'all_life_stages', 'dog', 1, 20),

  ('food_model', 'ray_yvonne_deer_eggshell_raw_9p', '["ray_n_yvonne"]', '["ray_yvonne_raw_line"]', '["raw_food_core"]', '레이앤이본 사슴고기 난각 생식 9P', 1, '', '', 9, 'pack', 'adult', 'dog', 1, 21),
  ('food_model', 'ray_yvonne_lamb_bone_raw_12p', '["ray_n_yvonne"]', '["ray_yvonne_raw_line"]', '["raw_food_core"]', '레이앤이본 뼈있는 양고기 생식 12P', 1, '', '', 12, 'pack', 'adult', 'dog', 1, 22),
  ('food_model', 'ray_yvonne_beef_cooked_12p', '["ray_n_yvonne"]', '["ray_yvonne_cooked_line"]', '["wet_food_core"]', '레이앤이본 소고기 요리 12P', 1, '', '', 12, 'pack', 'adult', 'dog', 1, 23),
  ('food_model', 'ray_yvonne_chicken_renal_care_12p', '["ray_n_yvonne"]', '["ray_yvonne_management_line"]', '["prescription_diet_core"]', '레이앤이본 닭고기 신장관리식 12P', 1, '', '', 12, 'pack', 'adult', 'dog', 1, 24),
  ('food_model', 'ray_yvonne_chicken_pancreas_care_12p', '["ray_n_yvonne"]', '["ray_yvonne_management_line"]', '["prescription_diet_core"]', '레이앤이본 닭고기 췌장관리식 12P', 1, '', '', 12, 'pack', 'adult', 'dog', 1, 25);

-- =========================================================
-- 4) nutrient_type_seed
-- =========================================================
CREATE TABLE IF NOT EXISTS nutrient_type_seed (
  key TEXT PRIMARY KEY,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS measurement_unit_seed (
  key TEXT PRIMARY KEY,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS nutrition_basis_type_seed (
  key TEXT PRIMARY KEY,
  label_ko TEXT NOT NULL,
  auto_translate_from_ko INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1
);

INSERT OR REPLACE INTO nutrient_type_seed (key, label_ko, auto_translate_from_ko, is_active) VALUES
  ('energy', '에너지', 1, 1),
  ('moisture', '수분', 1, 1),
  ('crude_protein', '조단백', 1, 1),
  ('crude_fat', '조지방', 1, 1),
  ('crude_fiber', '조섬유', 1, 1),
  ('crude_ash', '조회분', 1, 1),
  ('calcium', '칼슘', 1, 1),
  ('phosphorus', '인', 1, 1),
  ('magnesium', '마그네슘', 1, 1),
  ('sodium', '나트륨', 1, 1),
  ('potassium', '칼륨', 1, 1),
  ('taurine', '타우린', 1, 1),
  ('vitamin_d', '비타민D', 1, 1),
  ('vitamin_e_alpha', '비타민E', 1, 1),
  ('omega3', '오메가3', 1, 1),
  ('omega6', '오메가6', 1, 1),
  ('epa_dha', 'EPA+DHA', 1, 1),
  ('epa', 'EPA', 1, 1),
  ('dha', 'DHA', 1, 1);

INSERT OR REPLACE INTO measurement_unit_seed (key, label_ko, auto_translate_from_ko, is_active) VALUES
  ('kcal', '킬로칼로리', 1, 1),
  ('percent', '퍼센트', 1, 1),
  ('g', '그램', 1, 1),
  ('mg', '밀리그램', 1, 1),
  ('ug', '마이크로그램', 1, 1),
  ('iu', '국제단위', 1, 1);

INSERT OR REPLACE INTO nutrition_basis_type_seed (key, label_ko, auto_translate_from_ko, is_active) VALUES
  ('as_fed', '급여기준', 1, 1),
  ('dry_matter', '건물기준', 1, 1),
  ('per_100g', '100g당', 1, 1),
  ('per_serving', '1회급여당', 1, 1);

-- =========================================================
-- 5) food_model_nutrient_seed
-- Rule: only verifiable products are inserted
-- =========================================================
CREATE TABLE IF NOT EXISTS food_model_nutrient_seed (
  food_model_key TEXT NOT NULL,
  nutrient_key TEXT NOT NULL,
  basis_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  PRIMARY KEY (food_model_key, nutrient_key, basis_type, unit)
);

INSERT OR REPLACE INTO food_model_nutrient_seed (food_model_key, nutrient_key, basis_type, value, unit) VALUES
  ('royal_canin_small_adult_dry_14lb', 'crude_protein', 'as_fed', 25.0, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'crude_fat', 'as_fed', 14.0, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'crude_fiber', 'as_fed', 3.4, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'moisture', 'as_fed', 10.0, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'epa', 'as_fed', 0.11, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'dha', 'as_fed', 0.05, 'percent'),
  ('royal_canin_small_adult_dry_14lb', 'energy', 'per_100g', 374.4, 'kcal'),

  ('royal_canin_medium_adult_dry_30lb', 'crude_protein', 'as_fed', 23.0, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'crude_fat', 'as_fed', 12.0, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'crude_fiber', 'as_fed', 3.4, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'moisture', 'as_fed', 10.5, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'calcium', 'as_fed', 0.85, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'phosphorus', 'as_fed', 0.56, 'percent'),
  ('royal_canin_medium_adult_dry_30lb', 'energy', 'per_100g', 361.6, 'kcal'),

  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_protein', 'as_fed', 23.8, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_fat', 'as_fed', 15.0, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'crude_fiber', 'as_fed', 1.7, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'calcium', 'as_fed', 0.8, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'phosphorus', 'as_fed', 0.69, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'omega3', 'as_fed', 0.61, 'percent'),
  ('hills_science_diet_adult_chicken_barley_dry_45lb', 'omega6', 'as_fed', 4.25, 'percent'),

  ('orijen_original_dry_dog_23_5lb', 'crude_protein', 'as_fed', 38.0, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'crude_fat', 'as_fed', 18.0, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'crude_fiber', 'as_fed', 4.0, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'moisture', 'as_fed', 12.0, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'dha', 'as_fed', 0.2, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'epa', 'as_fed', 0.2, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'calcium', 'as_fed', 1.2, 'percent'),
  ('orijen_original_dry_dog_23_5lb', 'phosphorus', 'as_fed', 1.0, 'percent'),

  ('acana_wild_atlantic_dry_cat_10lb', 'crude_protein', 'as_fed', 36.0, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'crude_fat', 'as_fed', 18.0, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'crude_fiber', 'as_fed', 4.0, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'moisture', 'as_fed', 10.0, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'epa', 'as_fed', 0.5, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'dha', 'as_fed', 0.6, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'calcium', 'as_fed', 1.4, 'percent'),
  ('acana_wild_atlantic_dry_cat_10lb', 'phosphorus', 'as_fed', 1.0, 'percent');

COMMIT;
