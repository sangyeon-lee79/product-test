-- 0036: Food category full seed (diet_type L1 / diet_subtype L2)

UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('diet_type', 'diet_subtype');

-- L1 diet_type
WITH l1(id, code, sort_order) AS (
  VALUES
    ('mi-diet-dry-food', 'dry_food', 1),
    ('mi-diet-wet-food', 'wet_food', 2),
    ('mi-diet-freeze-dried-food', 'freeze_dried_food', 3),
    ('mi-diet-raw-food', 'raw_food', 4),
    ('mi-diet-fresh-food', 'fresh_food', 5),
    ('mi-diet-prescription-food', 'prescription_food', 6),
    ('mi-diet-snack', 'snack', 7),
    ('mi-diet-supplement-food', 'supplement_food', 8)
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

-- L2 diet_subtype
WITH l2(id, parent_code, code, sort_order) AS (
  VALUES
    -- Dry food
    ('mi-diet-sub-puppy-dry-food', 'dry_food', 'puppy_dry_food', 1),
    ('mi-diet-sub-adult-dry-food', 'dry_food', 'adult_dry_food', 2),
    ('mi-diet-sub-senior-dry-food', 'dry_food', 'senior_dry_food', 3),
    ('mi-diet-sub-small-breed-dry', 'dry_food', 'small_breed_dry', 4),
    ('mi-diet-sub-large-breed-dry', 'dry_food', 'large_breed_dry', 5),
    ('mi-diet-sub-weight-control-dry', 'dry_food', 'weight_control_dry', 6),
    ('mi-diet-sub-grain-free-dry', 'dry_food', 'grain_free_dry', 7),
    ('mi-diet-sub-hypoallergenic-dry', 'dry_food', 'hypoallergenic_dry', 8),
    ('mi-diet-sub-high-protein-dry', 'dry_food', 'high_protein_dry', 9),
    ('mi-diet-sub-sensitive-stomach-dry', 'dry_food', 'sensitive_stomach_dry', 10),

    -- Wet food
    ('mi-diet-sub-canned-food', 'wet_food', 'canned_food', 20),
    ('mi-diet-sub-pouch-food', 'wet_food', 'pouch_food', 21),
    ('mi-diet-sub-stew-food', 'wet_food', 'stew_food', 22),
    ('mi-diet-sub-pate-food', 'wet_food', 'pate_food', 23),
    ('mi-diet-sub-gravy-food', 'wet_food', 'gravy_food', 24),

    -- Freeze-dried food
    ('mi-diet-sub-freeze-dried-meat', 'freeze_dried_food', 'freeze_dried_meat', 30),
    ('mi-diet-sub-freeze-dried-complete', 'freeze_dried_food', 'freeze_dried_complete', 31),
    ('mi-diet-sub-freeze-dried-snack', 'freeze_dried_food', 'freeze_dried_snack', 32),

    -- Raw food
    ('mi-diet-sub-raw-meat', 'raw_food', 'raw_meat', 40),
    ('mi-diet-sub-raw-pancreatic-diet', 'raw_food', 'raw_pancreatic_diet', 41),
    ('mi-diet-sub-raw-balanced-diet', 'raw_food', 'raw_balanced_diet', 42),
    ('mi-diet-sub-raw-frozen-food', 'raw_food', 'raw_frozen_food', 43),

    -- Prescription
    ('mi-diet-sub-kidney-diet', 'prescription_food', 'kidney_diet', 50),
    ('mi-diet-sub-diabetes-diet', 'prescription_food', 'diabetes_diet', 51),
    ('mi-diet-sub-gastrointestinal-diet', 'prescription_food', 'gastrointestinal_diet', 52),
    ('mi-diet-sub-urinary-diet', 'prescription_food', 'urinary_diet', 53),
    ('mi-diet-sub-allergy-diet', 'prescription_food', 'allergy_diet', 54),
    ('mi-diet-sub-hepatic-diet', 'prescription_food', 'hepatic_diet', 55),
    ('mi-diet-sub-weight-loss-diet', 'prescription_food', 'weight_loss_diet', 56),

    -- Snack
    ('mi-diet-sub-dental-snack', 'snack', 'dental_snack', 60),
    ('mi-diet-sub-training-snack', 'snack', 'training_snack', 61),
    ('mi-diet-sub-jerky-snack', 'snack', 'jerky_snack', 62),
    ('mi-diet-sub-chew-snack', 'snack', 'chew_snack', 63),
    ('mi-diet-sub-biscuit-snack', 'snack', 'biscuit_snack', 64),

    -- Supplement food
    ('mi-diet-sub-joint-supplement', 'supplement_food', 'joint_supplement', 70),
    ('mi-diet-sub-skin-coat-supplement', 'supplement_food', 'skin_coat_supplement', 71),
    ('mi-diet-sub-digestive-supplement', 'supplement_food', 'digestive_supplement', 72),
    ('mi-diet-sub-immune-support-food', 'supplement_food', 'immune_support_food', 73),
    ('mi-diet-sub-vitamin-supplement', 'supplement_food', 'vitamin_supplement', 74)
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
  ON p.code = l2.parent_code
 AND p.category_id = (SELECT id FROM master_categories WHERE code = 'diet_type' LIMIT 1);

-- i18n
WITH t(key, ko, en) AS (
  VALUES
    ('master.diet_type.dry_food', '건식사료', 'Dry Food'),
    ('master.diet_type.wet_food', '습식사료', 'Wet Food'),
    ('master.diet_type.freeze_dried_food', '동결건조 사료', 'Freeze-dried Food'),
    ('master.diet_type.raw_food', '생식 사료', 'Raw Food'),
    ('master.diet_type.fresh_food', '생식/신선식', 'Fresh Food'),
    ('master.diet_type.prescription_food', '처방식 사료', 'Prescription Diet'),
    ('master.diet_type.snack', '간식', 'Snack'),
    ('master.diet_type.supplement_food', '보조 영양식', 'Supplement Food'),

    ('master.diet_subtype.puppy_dry_food', '퍼피 건식사료', 'Puppy Dry Food'),
    ('master.diet_subtype.adult_dry_food', '어덜트 건식사료', 'Adult Dry Food'),
    ('master.diet_subtype.senior_dry_food', '시니어 건식사료', 'Senior Dry Food'),
    ('master.diet_subtype.small_breed_dry', '소형견 건식사료', 'Small Breed Dry Food'),
    ('master.diet_subtype.large_breed_dry', '대형견 건식사료', 'Large Breed Dry Food'),
    ('master.diet_subtype.weight_control_dry', '체중관리 건식사료', 'Weight Control Dry Food'),
    ('master.diet_subtype.grain_free_dry', '그레인프리 건식사료', 'Grain-free Dry Food'),
    ('master.diet_subtype.hypoallergenic_dry', '저알러지 건식사료', 'Hypoallergenic Dry Food'),
    ('master.diet_subtype.high_protein_dry', '고단백 건식사료', 'High Protein Dry Food'),
    ('master.diet_subtype.sensitive_stomach_dry', '소화기 민감 건식사료', 'Sensitive Stomach Dry Food'),

    ('master.diet_subtype.canned_food', '캔 사료', 'Canned Food'),
    ('master.diet_subtype.pouch_food', '파우치 사료', 'Pouch Food'),
    ('master.diet_subtype.stew_food', '스튜 타입 사료', 'Stew Food'),
    ('master.diet_subtype.pate_food', '파테 타입 사료', 'Pate Food'),
    ('master.diet_subtype.gravy_food', '그레이비 타입 사료', 'Gravy Food'),

    ('master.diet_subtype.freeze_dried_meat', '동결건조 육류', 'Freeze-dried Meat'),
    ('master.diet_subtype.freeze_dried_complete', '동결건조 완전식', 'Freeze-dried Complete Meal'),
    ('master.diet_subtype.freeze_dried_snack', '동결건조 간식', 'Freeze-dried Snack'),

    ('master.diet_subtype.raw_meat', '생육식', 'Raw Meat Diet'),
    ('master.diet_subtype.raw_pancreatic_diet', '췌장식', 'Pancreatic Raw Diet'),
    ('master.diet_subtype.raw_balanced_diet', '균형 생식', 'Balanced Raw Diet'),
    ('master.diet_subtype.raw_frozen_food', '냉동 생식', 'Frozen Raw Food'),

    ('master.diet_subtype.kidney_diet', '신장 처방식', 'Kidney Diet'),
    ('master.diet_subtype.diabetes_diet', '당뇨 처방식', 'Diabetes Diet'),
    ('master.diet_subtype.gastrointestinal_diet', '소화기 처방식', 'Gastrointestinal Diet'),
    ('master.diet_subtype.urinary_diet', '요로 처방식', 'Urinary Diet'),
    ('master.diet_subtype.allergy_diet', '알러지 처방식', 'Allergy Diet'),
    ('master.diet_subtype.hepatic_diet', '간 질환 처방식', 'Hepatic Diet'),
    ('master.diet_subtype.weight_loss_diet', '체중감량 처방식', 'Weight Loss Diet'),

    ('master.diet_subtype.dental_snack', '덴탈 간식', 'Dental Snack'),
    ('master.diet_subtype.training_snack', '트레이닝 간식', 'Training Snack'),
    ('master.diet_subtype.jerky_snack', '육포 간식', 'Jerky Snack'),
    ('master.diet_subtype.chew_snack', '씹는 간식', 'Chew Snack'),
    ('master.diet_subtype.biscuit_snack', '비스킷 간식', 'Biscuit Snack'),

    ('master.diet_subtype.joint_supplement', '관절 영양식', 'Joint Supplement'),
    ('master.diet_subtype.skin_coat_supplement', '피부/피모 영양식', 'Skin & Coat Supplement'),
    ('master.diet_subtype.digestive_supplement', '장 건강 영양식', 'Digestive Supplement'),
    ('master.diet_subtype.immune_support_food', '면역 강화 영양식', 'Immune Support Food'),
    ('master.diet_subtype.vitamin_supplement', '비타민 보충식', 'Vitamin Supplement')
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
    ('master.diet_type.dry_food', '건식사료', 'Dry Food'),
    ('master.diet_type.wet_food', '습식사료', 'Wet Food'),
    ('master.diet_type.freeze_dried_food', '동결건조 사료', 'Freeze-dried Food'),
    ('master.diet_type.raw_food', '생식 사료', 'Raw Food'),
    ('master.diet_type.fresh_food', '생식/신선식', 'Fresh Food'),
    ('master.diet_type.prescription_food', '처방식 사료', 'Prescription Diet'),
    ('master.diet_type.snack', '간식', 'Snack'),
    ('master.diet_type.supplement_food', '보조 영양식', 'Supplement Food'),
    ('master.diet_subtype.puppy_dry_food', '퍼피 건식사료', 'Puppy Dry Food'),
    ('master.diet_subtype.adult_dry_food', '어덜트 건식사료', 'Adult Dry Food'),
    ('master.diet_subtype.senior_dry_food', '시니어 건식사료', 'Senior Dry Food'),
    ('master.diet_subtype.small_breed_dry', '소형견 건식사료', 'Small Breed Dry Food'),
    ('master.diet_subtype.large_breed_dry', '대형견 건식사료', 'Large Breed Dry Food'),
    ('master.diet_subtype.weight_control_dry', '체중관리 건식사료', 'Weight Control Dry Food'),
    ('master.diet_subtype.grain_free_dry', '그레인프리 건식사료', 'Grain-free Dry Food'),
    ('master.diet_subtype.hypoallergenic_dry', '저알러지 건식사료', 'Hypoallergenic Dry Food'),
    ('master.diet_subtype.high_protein_dry', '고단백 건식사료', 'High Protein Dry Food'),
    ('master.diet_subtype.sensitive_stomach_dry', '소화기 민감 건식사료', 'Sensitive Stomach Dry Food'),
    ('master.diet_subtype.canned_food', '캔 사료', 'Canned Food'),
    ('master.diet_subtype.pouch_food', '파우치 사료', 'Pouch Food'),
    ('master.diet_subtype.stew_food', '스튜 타입 사료', 'Stew Food'),
    ('master.diet_subtype.pate_food', '파테 타입 사료', 'Pate Food'),
    ('master.diet_subtype.gravy_food', '그레이비 타입 사료', 'Gravy Food'),
    ('master.diet_subtype.freeze_dried_meat', '동결건조 육류', 'Freeze-dried Meat'),
    ('master.diet_subtype.freeze_dried_complete', '동결건조 완전식', 'Freeze-dried Complete Meal'),
    ('master.diet_subtype.freeze_dried_snack', '동결건조 간식', 'Freeze-dried Snack'),
    ('master.diet_subtype.raw_meat', '생육식', 'Raw Meat Diet'),
    ('master.diet_subtype.raw_pancreatic_diet', '췌장식', 'Pancreatic Raw Diet'),
    ('master.diet_subtype.raw_balanced_diet', '균형 생식', 'Balanced Raw Diet'),
    ('master.diet_subtype.raw_frozen_food', '냉동 생식', 'Frozen Raw Food'),
    ('master.diet_subtype.kidney_diet', '신장 처방식', 'Kidney Diet'),
    ('master.diet_subtype.diabetes_diet', '당뇨 처방식', 'Diabetes Diet'),
    ('master.diet_subtype.gastrointestinal_diet', '소화기 처방식', 'Gastrointestinal Diet'),
    ('master.diet_subtype.urinary_diet', '요로 처방식', 'Urinary Diet'),
    ('master.diet_subtype.allergy_diet', '알러지 처방식', 'Allergy Diet'),
    ('master.diet_subtype.hepatic_diet', '간 질환 처방식', 'Hepatic Diet'),
    ('master.diet_subtype.weight_loss_diet', '체중감량 처방식', 'Weight Loss Diet'),
    ('master.diet_subtype.dental_snack', '덴탈 간식', 'Dental Snack'),
    ('master.diet_subtype.training_snack', '트레이닝 간식', 'Training Snack'),
    ('master.diet_subtype.jerky_snack', '육포 간식', 'Jerky Snack'),
    ('master.diet_subtype.chew_snack', '씹는 간식', 'Chew Snack'),
    ('master.diet_subtype.biscuit_snack', '비스킷 간식', 'Biscuit Snack'),
    ('master.diet_subtype.joint_supplement', '관절 영양식', 'Joint Supplement'),
    ('master.diet_subtype.skin_coat_supplement', '피부/피모 영양식', 'Skin & Coat Supplement'),
    ('master.diet_subtype.digestive_supplement', '장 건강 영양식', 'Digestive Supplement'),
    ('master.diet_subtype.immune_support_food', '면역 강화 영양식', 'Immune Support Food'),
    ('master.diet_subtype.vitamin_supplement', '비타민 보충식', 'Vitamin Supplement')
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
  ja = COALESCE(NULLIF(ja, ''), en),
  zh_cn = COALESCE(NULLIF(zh_cn, ''), en),
  zh_tw = COALESCE(NULLIF(zh_tw, ''), en),
  es = COALESCE(NULLIF(es, ''), en),
  fr = COALESCE(NULLIF(fr, ''), en),
  de = COALESCE(NULLIF(de, ''), en),
  pt = COALESCE(NULLIF(pt, ''), en),
  vi = COALESCE(NULLIF(vi, ''), en),
  th = COALESCE(NULLIF(th, ''), en),
  id_lang = COALESCE(NULLIF(id_lang, ''), en),
  ar = COALESCE(NULLIF(ar, ''), en),
  is_active = 1,
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);
