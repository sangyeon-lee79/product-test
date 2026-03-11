-- 075_knrc_ray_yvonne_full_seed.sql
-- Ray & Yvonne (레이앤이본) 전 제품 시드 등록
-- 제조사: 한국반려동물영양연구소 (KNRC) / 브랜드: Ray & Yvonne
-- 기존 MFR ID: 5147d84c6992d4248142d3bc8e74a571

-- ═══════════════════════════════════════════════════════════════
-- 1. 간식 브랜드 추가 (treat brand)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_brands (id, manufacturer_id, name_key, name_ko, name_en, status, created_at, updated_at)
VALUES
  ('a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4', '5147d84c6992d4248142d3bc8e74a571', 'feed.brand.ray_yvonne_treat_line', '레이앤이본 간식', 'Ray & Yvonne Treats', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- brand i18n
INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'feed.brand.ray_yvonne_treat_line', 'feed', '레이앤이본 간식', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', 'Ray & Yvonne Treats', true, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- brand-manufacturer link
INSERT INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
VALUES
  ('b8d4f0a2c4e6a8d0f2a4c6e8b0d2f4a6', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4', '5147d84c6992d4248142d3bc8e74a571', NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. 생식 라인 (Raw) — brand: b5248fc836d32e4644a06a6554b575b6
--    feed_type: mi-diet-feed-raw-frozen-food-core
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, image_url, status, created_at, updated_at)
VALUES
  -- 1. 뼈있는 오리고기 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c101', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_duck_bone_raw_12p', '뼈있는 오리고기 생식 12P', 'ry-raw-duck-bone-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719566670/thumb-67CY66Ck6rKs642V67O4_230x320.jpg',
   'active', NOW(), NOW()),

  -- 2. 오리고기 난각 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c102', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_duck_eggshell_raw_12p', '오리고기 난각 생식 12P', 'ry-raw-duck-egg-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719566320/thumb-67CY66Ck6rKs642V66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 3. 고양이 뼈있는 오리고기 생식 12P (cat)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c103', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_duck_bone_feline_12p', '고양이 뼈있는 오리고기 생식 12P', 'ry-raw-duck-bone-cat-12p',
   '{"species_key":"cat","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719565885/thumb-67CY66Ck66yY642V67O4_230x320.jpg',
   'active', NOW(), NOW()),

  -- 4. 고양이 오리고기 난각 생식 12P (cat)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c104', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_duck_eggshell_feline_12p', '고양이 오리고기 난각 생식 12P', 'ry-raw-duck-egg-cat-12p',
   '{"species_key":"cat","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719565390/thumb-67CY66Ck66yY642V66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 5. 뼈있는 닭고기 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c105', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_chicken_bone_raw_12p', '뼈있는 닭고기 생식 12P', 'ry-raw-chicken-bone-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719565892/thumb-67CY66Ck6rKs7LmY7YKo67O4_230x320.jpg',
   'active', NOW(), NOW()),

  -- 6. 소고기 난각 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c106', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_beef_eggshell_raw_12p', '소고기 난각 생식 12P', 'ry-raw-beef-egg-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719567023/thumb-67CY66Ck6rKs67mE7ZSE66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 7. 양고기 난각 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c107', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_lamb_eggshell_raw_12p', '양고기 난각 생식 12P', 'ry-raw-lamb-egg-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719567268/thumb-67CY66Ck6rKs656o66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 8. 닭고기 난각 생식 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c108', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_chicken_eggshell_raw_12p', '닭고기 난각 생식 12P', 'ry-raw-chicken-egg-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719565093/thumb-67CY66Ck6rKs7LmY7YKo66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 9. 고양이 닭고기 난각 생식 12P (cat)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c109', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_chicken_eggshell_feline_12p', '고양이 닭고기 난각 생식 12P', 'ry-raw-chicken-egg-cat-12p',
   '{"species_key":"cat","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719564867/thumb-67CY66Ck66yY7LmY7YKo66Gc7Jqw_230x320.jpg',
   'active', NOW(), NOW()),

  -- 10. 고양이 뼈있는 닭고기 생식 12P (cat) — 사이트에서 발견
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c10a', 'mi-diet-feed-raw-frozen-food-core', '5147d84c6992d4248142d3bc8e74a571', 'b5248fc836d32e4644a06a6554b575b6',
   'feed.model.ray_yvonne_chicken_bone_feline_12p', '고양이 뼈있는 닭고기 생식 12P', 'ry-raw-chicken-bone-cat-12p',
   '{"species_key":"cat","grain_free":true,"food_form":"raw","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719566217/thumb-67CY66Ck66yY7LmY7YKo67O4_230x320.jpg',
   'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update image_url for existing raw products
UPDATE feed_models SET image_url = 'https://www.knrc.co.kr/data/item/1719567670/thumb-67CY66Ck6rKs65SU7Ja066Gc7Jqw_230x320.jpg' WHERE id = '540f62700cddf97bc9e559bebeb075cb' AND image_url IS NULL;
UPDATE feed_models SET image_url = 'https://www.knrc.co.kr/data/item/1719567500/thumb-67CY66Ck6rKs656o67O4_230x320.jpg' WHERE id = '958216d2122d7546cc6e1a9603406be9' AND image_url IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- 3. 조리식 라인 (Cooked) — brand: 42eea7073831e65e3c339450ebd82699
--    feed_type: mi-diet-feed-wet-food-core
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, image_url, status, created_at, updated_at)
VALUES
  -- 1. 닭고기 요리 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c201', 'mi-diet-feed-wet-food-core', '5147d84c6992d4248142d3bc8e74a571', '42eea7073831e65e3c339450ebd82699',
   'feed.model.ray_yvonne_chicken_cooked_12p', '닭고기 요리 12P', 'ry-cooked-chicken-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719567550/thumb-67CY66Ck6rKs7LmY7YKo7Lh_230x320.jpg',
   'active', NOW(), NOW()),

  -- 2. 양고기 요리 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c202', 'mi-diet-feed-wet-food-core', '5147d84c6992d4248142d3bc8e74a571', '42eea7073831e65e3c339450ebd82699',
   'feed.model.ray_yvonne_lamb_cooked_12p', '양고기 요리 12P', 'ry-cooked-lamb-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719567695/thumb-67CY66Ck6rKs656o7Lh_230x320.jpg',
   'active', NOW(), NOW()),

  -- 3. 오리고기 요리 12P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c203', 'mi-diet-feed-wet-food-core', '5147d84c6992d4248142d3bc8e74a571', '42eea7073831e65e3c339450ebd82699',
   'feed.model.ray_yvonne_duck_cooked_12p', '오리고기 요리 12P', 'ry-cooked-duck-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","package_weight_value":12,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719567953/thumb-67CY66Ck6rKs642V7Lh_230x320.jpg',
   'active', NOW(), NOW()),

  -- 4. 사슴고기 요리 9P (dog)
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c204', 'mi-diet-feed-wet-food-core', '5147d84c6992d4248142d3bc8e74a571', '42eea7073831e65e3c339450ebd82699',
   'feed.model.ray_yvonne_deer_cooked_9p', '사슴고기 요리 9P', 'ry-cooked-deer-9p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","package_weight_value":9,"package_weight_unit":"pack"}',
   'https://www.knrc.co.kr/data/item/1719568105/thumb-67CY66Ck6rKs65SU7Ja07Lh_230x320.jpg',
   'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update image_url for existing cooked product
UPDATE feed_models SET image_url = 'https://www.knrc.co.kr/data/item/1719566447/thumb-67CY66Ck6rKs67mE7ZSE7Lh_230x320.jpg' WHERE id = 'bd085857f00fa01d0fa5231c38abfce9' AND image_url IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- 4. 관리식 라인 (Care/Prescribed) — brand: f1edff7fb2746e10ee737e0c6d441c15
--    feed_type: mi-diet-feed-prescription-diet-core
--    ⚠️ prescribed: true
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, image_url, status, created_at, updated_at)
VALUES
  -- 1. 닭고기 중단백관리식 12P (dog) — 크롤링 발견
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c301', 'mi-diet-feed-prescription-diet-core', '5147d84c6992d4248142d3bc8e74a571', 'f1edff7fb2746e10ee737e0c6d441c15',
   'feed.model.ray_yvonne_chicken_mid_protein_care_12p', '닭고기 중단백관리식 12P', 'ry-care-chicken-mid-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","prescribed":true,"package_weight_value":12,"package_weight_unit":"pack","care_type":"mid_protein"}',
   'https://www.knrc.co.kr/data/item/1719563365/thumb-7Iqk7YGs66aw7IO320240628173414_230x320.png',
   'active', NOW(), NOW()),

  -- 2. 소고기 중단백 관리식 12P (dog) — 크롤링 발견
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c302', 'mi-diet-feed-prescription-diet-core', '5147d84c6992d4248142d3bc8e74a571', 'f1edff7fb2746e10ee737e0c6d441c15',
   'feed.model.ray_yvonne_beef_mid_protein_care_12p', '소고기 중단백 관리식 12P', 'ry-care-beef-mid-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","prescribed":true,"package_weight_value":12,"package_weight_unit":"pack","care_type":"mid_protein"}',
   'https://www.knrc.co.kr/data/item/1719564847/thumb-7Iqk7YGs66aw7IO320240628175352_230x320.png',
   'active', NOW(), NOW()),

  -- 3. 소고기 췌장관리식 12P (dog) — 크롤링 발견
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c303', 'mi-diet-feed-prescription-diet-core', '5147d84c6992d4248142d3bc8e74a571', 'f1edff7fb2746e10ee737e0c6d441c15',
   'feed.model.ray_yvonne_beef_pancreas_care_12p', '소고기 췌장관리식 12P', 'ry-care-beef-pancreas-12p',
   '{"species_key":"dog","grain_free":true,"food_form":"cooked","prescribed":true,"package_weight_value":12,"package_weight_unit":"pack","care_type":"pancreas"}',
   'https://www.knrc.co.kr/data/item/1719566534/thumb-67CY66Ck6rKs7LeM7J6l_7IaM_230x320.jpg',
   'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update image_url for existing care products
UPDATE feed_models SET image_url = 'https://www.knrc.co.kr/data/item/1719565900/thumb-67CY66Ck6rKs7Iug7J6l6rSA66as7Iud_230x320.jpg' WHERE id = '98639042eadd07384d21afa17b8ecf3b' AND image_url IS NULL;
UPDATE feed_models SET image_url = 'https://www.knrc.co.kr/data/item/1719566290/thumb-67CY66Ck6rKs7LeM7J6l_64ut_230x320.jpg' WHERE id = '017675d248027257bfcb8943d1626f0d' AND image_url IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- 5. 간식 라인 (Treats) — brand: a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4
--    feed_type: mi-diet-feed-snack-treat-core
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_models (id, feed_type_item_id, manufacturer_id, brand_id, name_key, model_name, model_code, description, image_url, status, created_at, updated_at)
VALUES
  -- 1. 화이트 치킨 스튜
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c401', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_white_chicken_stew', '화이트 치킨 스튜', 'ry-treat-white-chicken-stew',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719457347/thumb-44WY7J207Yq47LmY7YKo7Iqk7Yqc_230x320.jpg',
   'active', NOW(), NOW()),

  -- 2. 에그롤테린
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c402', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_egg_roll_terin', '에그롤테린', 'ry-treat-egg-roll-terin',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1672369809/thumb-7JeQ6re466Gk7YWM66aw_66mU7J24_230x320.jpg',
   'active', NOW(), NOW()),

  -- 3. 레드 비프 스튜
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c403', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_red_beef_stew', '레드 비프 스튜', 'ry-treat-red-beef-stew',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719466895/thumb-66CI65Oc67mE7ZSX7Yqc_230x320.jpg',
   'active', NOW(), NOW()),

  -- 4. 옐로우 스윗 덕 스튜
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c404', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_yellow_sweet_duck_stew', '옐로우 스윗 덕 스튜', 'ry-treat-yellow-duck-stew',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719467491/thumb-7JiQ66Gc7Jqw642V7Iqk7Yqc_230x320.jpg',
   'active', NOW(), NOW()),

  -- 5. 양곰탕
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c405', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_lamb_soup', '양곰탕', 'ry-treat-lamb-soup',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719467750/thumb-656o7Iqk7Yqc_230x320.jpg',
   'active', NOW(), NOW()),

  -- 6. 베이지끄 치킨
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c406', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_basque_chicken', '베이지끄 치킨', 'ry-treat-basque-chicken',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719469776/thumb-67Kg7J207KeA64GE7LmY7YKo_230x320.jpg',
   'active', NOW(), NOW()),

  -- 7. 베이지끄 덕
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c407', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_basque_duck', '베이지끄 덕', 'ry-treat-basque-duck',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719470595/thumb-67Kg7J207KeA64GE642V_230x320.jpg',
   'active', NOW(), NOW()),

  -- 8. 베이지끄 비프
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c408', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_basque_beef', '베이지끄 비프', 'ry-treat-basque-beef',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1719470760/thumb-67Kg7J207KeA64GE7IaM_230x320.jpg',
   'active', NOW(), NOW()),

  -- 9. 촉촉한 닭가슴살 육포
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c409', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_moist_chicken_jerky', '촉촉한 닭가슴살 육포', 'ry-treat-moist-chicken-jerky',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1610520571/thumb-64ut6rCA7Iq07IK01_230x320.jpg',
   'active', NOW(), NOW()),

  -- 10. 촉촉한 오리안심 육포
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c40a', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_moist_duck_jerky', '촉촉한 오리안심 육포', 'ry-treat-moist-duck-jerky',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1610520615/thumb-7Jik66as7JWI7Ius1_230x320.jpg',
   'active', NOW(), NOW()),

  -- 11. 꼬꼬단케이크
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c40b', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_chicken_cake', '꼬꼬단케이크', 'ry-treat-chicken-cake',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1672369285/thumb-6rys6rys64uo7LyA7J207YGs_66mU7J24_230x320.jpg',
   'active', NOW(), NOW()),

  -- 12. 과일치즈
  ('a1b1c1d1e1f1a1b1c1d1e1f1a1b1c40c', 'mi-diet-feed-snack-treat-core', '5147d84c6992d4248142d3bc8e74a571', 'a7c3e9f1b2d4a6c8e0f2a4c6e8b0d2f4',
   'feed.model.ray_yvonne_fruit_cheese', '과일치즈', 'ry-treat-fruit-cheese',
   '{"species_key":"dog","grain_free":true,"food_form":"treat"}',
   'https://www.knrc.co.kr/data/item/1754980167/thumb-37KKF_230x320.jpg',
   'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 6. manufacturer_type_links 추가 (간식 타입)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
VALUES
  ('f4a6c8e0d2b4a6c8e0f2a4c6e8b0d2f4', '5147d84c6992d4248142d3bc8e74a571', 'mi-diet-feed-snack-treat-core', NOW())
ON CONFLICT DO NOTHING;
