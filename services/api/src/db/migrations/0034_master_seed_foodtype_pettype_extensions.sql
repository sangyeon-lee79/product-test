-- 0034: Master seed extensions (Food Type / Pet Type)
-- Rule: DB seed only, no frontend hardcoding

-- Keep required categories active
UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('diet_type', 'diet_subtype', 'pet_type');

-- -----------------------------------------------------------------------------
-- 1) Food Type > Dry Food > Dry Food Type
-- -----------------------------------------------------------------------------

-- L2: Dry Food (under diet_type)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  'mi-diet-dry-food',
  c.id,
  NULL,
  'dry_food',
  30,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM master_categories c
WHERE c.code = 'diet_type';

-- L3: Dry Food Type (under diet_subtype, parent=dry_food)
WITH dry_subtypes(id, code, sort_order) AS (
  VALUES
    ('mi-diet-sub-puppy-dry-food', 'puppy_dry_food', 1),
    ('mi-diet-sub-adult-dry-food', 'adult_dry_food', 2),
    ('mi-diet-sub-senior-dry-food', 'senior_dry_food', 3),
    ('mi-diet-sub-weight-control-dry-food', 'weight_control_dry_food', 4),
    ('mi-diet-sub-grain-free-dry-food', 'grain_free_dry_food', 5),
    ('mi-diet-sub-veterinary-diet-dry-food', 'veterinary_diet_dry_food', 6)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  s.id,
  c.id,
  p.id,
  s.code,
  s.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM dry_subtypes s
JOIN master_categories c ON c.code = 'diet_subtype'
JOIN master_items p
  ON p.code = 'dry_food'
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_type' LIMIT 1);

-- -----------------------------------------------------------------------------
-- 2) Pet Type > Dog > Dog Breed
-- -----------------------------------------------------------------------------

WITH dog_breeds(id, code, sort_order) AS (
  VALUES
    ('mi-breed-poodle', 'poodle', 2),
    ('mi-breed-dog-maltese', 'maltese', 1),
    ('mi-breed-dog-shih-tzu', 'shih_tzu', 5),
    ('mi-breed-dog-chihuahua', 'chihuahua', 9),
    ('mi-breed-golden', 'golden_retriever', 6),
    ('mi-breed-dog-labrador', 'labrador_retriever', 7),
    ('mi-breed-dog-french-bulldog', 'french_bulldog', 12),
    ('mi-breed-dog-corgi', 'corgi', 13)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  b.id,
  c.id,
  d.id,
  b.code,
  b.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM dog_breeds b
JOIN master_categories c ON c.code = 'pet_type'
JOIN master_items d
  ON d.code = 'dog'
 AND d.category_id = c.id;

-- Enforce dog parent linkage for listed breeds
UPDATE master_items
SET
  parent_item_id = (
    SELECT id FROM master_items
    WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
      AND code = 'dog'
    LIMIT 1
  ),
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'pet_type' LIMIT 1)
  AND code IN ('poodle', 'maltese', 'shih_tzu', 'chihuahua', 'golden_retriever', 'labrador_retriever', 'french_bulldog', 'corgi');

-- -----------------------------------------------------------------------------
-- 3) i18n seed (all items must have translations)
-- -----------------------------------------------------------------------------

WITH t(key, ko, en, ja, zh_cn, zh_tw, vi) AS (
  VALUES
    ('master.diet_type.dry_food', '건식사료', 'Dry Food', 'ドライフード', '干粮', '乾糧', 'Thuc an kho'),
    ('master.diet_subtype.puppy_dry_food', '퍼피 건식사료', 'Puppy Dry Food', '子犬用ドライフード', '幼犬干粮', '幼犬乾糧', 'Thuc an kho cho cho con'),
    ('master.diet_subtype.adult_dry_food', '어덜트 건식사료', 'Adult Dry Food', '成犬用ドライフード', '成犬干粮', '成犬乾糧', 'Thuc an kho cho cho truong thanh'),
    ('master.diet_subtype.senior_dry_food', '시니어 건식사료', 'Senior Dry Food', 'シニア用ドライフード', '老年犬干粮', '老年犬乾糧', 'Thuc an kho cho cho cao tuoi'),
    ('master.diet_subtype.weight_control_dry_food', '체중관리 건식사료', 'Weight Control Dry Food', '体重管理ドライフード', '体重控制干粮', '體重控制乾糧', 'Thuc an kho kiem soat can nang'),
    ('master.diet_subtype.grain_free_dry_food', '그레인프리 건식사료', 'Grain-Free Dry Food', 'グレインフリードライフード', '无谷物干粮', '無穀乾糧', 'Thuc an kho khong ngu coc'),
    ('master.diet_subtype.veterinary_diet_dry_food', '처방식 건식사료', 'Veterinary Diet Dry Food', '療法食ドライフード', '处方干粮', '處方乾糧', 'Thuc an kho dieu tri thu y'),

    ('master.pet_type.poodle', '푸들', 'Poodle', 'プードル', '贵宾犬', '貴賓犬', 'Poodle'),
    ('master.pet_type.maltese', '말티즈', 'Maltese', 'マルチーズ', '马尔济斯犬', '馬爾濟斯犬', 'Maltese'),
    ('master.pet_type.shih_tzu', '시츄', 'Shih Tzu', 'シーズー', '西施犬', '西施犬', 'Shih Tzu'),
    ('master.pet_type.chihuahua', '치와와', 'Chihuahua', 'チワワ', '吉娃娃', '吉娃娃', 'Chihuahua'),
    ('master.pet_type.golden_retriever', '골든리트리버', 'Golden Retriever', 'ゴールデンレトリバー', '金毛寻回犬', '黃金獵犬', 'Golden Retriever'),
    ('master.pet_type.labrador_retriever', '래브라도 리트리버', 'Labrador Retriever', 'ラブラドールレトリバー', '拉布拉多寻回犬', '拉布拉多獵犬', 'Labrador Retriever'),
    ('master.pet_type.french_bulldog', '프렌치불독', 'French Bulldog', 'フレンチブルドッグ', '法国斗牛犬', '法國鬥牛犬', 'French Bulldog'),
    ('master.pet_type.corgi', '코기', 'Corgi', 'コーギー', '柯基犬', '柯基犬', 'Corgi')
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
  t.ja,
  t.zh_cn,
  t.zh_tw,
  t.en,
  t.en,
  t.en,
  t.en,
  t.vi,
  t.en,
  t.en,
  t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en, ja, zh_cn, zh_tw, vi) AS (
  VALUES
    ('master.diet_type.dry_food', '건식사료', 'Dry Food', 'ドライフード', '干粮', '乾糧', 'Thuc an kho'),
    ('master.diet_subtype.puppy_dry_food', '퍼피 건식사료', 'Puppy Dry Food', '子犬用ドライフード', '幼犬干粮', '幼犬乾糧', 'Thuc an kho cho cho con'),
    ('master.diet_subtype.adult_dry_food', '어덜트 건식사료', 'Adult Dry Food', '成犬用ドライフード', '成犬干粮', '成犬乾糧', 'Thuc an kho cho cho truong thanh'),
    ('master.diet_subtype.senior_dry_food', '시니어 건식사료', 'Senior Dry Food', 'シニア用ドライフード', '老年犬干粮', '老年犬乾糧', 'Thuc an kho cho cho cao tuoi'),
    ('master.diet_subtype.weight_control_dry_food', '체중관리 건식사료', 'Weight Control Dry Food', '体重管理ドライフード', '体重控制干粮', '體重控制乾糧', 'Thuc an kho kiem soat can nang'),
    ('master.diet_subtype.grain_free_dry_food', '그레인프리 건식사료', 'Grain-Free Dry Food', 'グレインフリードライフード', '无谷物干粮', '無穀乾糧', 'Thuc an kho khong ngu coc'),
    ('master.diet_subtype.veterinary_diet_dry_food', '처방식 건식사료', 'Veterinary Diet Dry Food', '療法食ドライフード', '处方干粮', '處方乾糧', 'Thuc an kho dieu tri thu y'),

    ('master.pet_type.poodle', '푸들', 'Poodle', 'プードル', '贵宾犬', '貴賓犬', 'Poodle'),
    ('master.pet_type.maltese', '말티즈', 'Maltese', 'マルチーズ', '马尔济斯犬', '馬爾濟斯犬', 'Maltese'),
    ('master.pet_type.shih_tzu', '시츄', 'Shih Tzu', 'シーズー', '西施犬', '西施犬', 'Shih Tzu'),
    ('master.pet_type.chihuahua', '치와와', 'Chihuahua', 'チワワ', '吉娃娃', '吉娃娃', 'Chihuahua'),
    ('master.pet_type.golden_retriever', '골든리트리버', 'Golden Retriever', 'ゴールデンレトリバー', '金毛寻回犬', '黃金獵犬', 'Golden Retriever'),
    ('master.pet_type.labrador_retriever', '래브라도 리트리버', 'Labrador Retriever', 'ラブラドールレトリバー', '拉布拉多寻回犬', '拉布拉多獵犬', 'Labrador Retriever'),
    ('master.pet_type.french_bulldog', '프렌치불독', 'French Bulldog', 'フレンチブルドッグ', '法国斗牛犬', '法國鬥牛犬', 'French Bulldog'),
    ('master.pet_type.corgi', '코기', 'Corgi', 'コーギー', '柯基犬', '柯基犬', 'Corgi')
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
  ja = (SELECT x.ja FROM t x WHERE x.key = i18n_translations.key),
  zh_cn = (SELECT x.zh_cn FROM t x WHERE x.key = i18n_translations.key),
  zh_tw = (SELECT x.zh_tw FROM t x WHERE x.key = i18n_translations.key),
  vi = (SELECT x.vi FROM t x WHERE x.key = i18n_translations.key),
  is_active = 1,
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);
