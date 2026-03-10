ALTER TABLE provider_profiles ADD COLUMN business_category_l3_id TEXT REFERENCES master_items(id);
ALTER TABLE provider_profiles ADD COLUMN pet_type_l1_id TEXT REFERENCES master_items(id);
ALTER TABLE provider_profiles ADD COLUMN pet_type_l2_id TEXT REFERENCES master_items(id);

ALTER TABLE role_applications ADD COLUMN business_category_l3_id TEXT REFERENCES master_items(id);
ALTER TABLE role_applications ADD COLUMN pet_type_l1_id TEXT REFERENCES master_items(id);
ALTER TABLE role_applications ADD COLUMN pet_type_l2_id TEXT REFERENCES master_items(id);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_business_l3 ON provider_profiles(business_category_l3_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_pet_l1 ON provider_profiles(pet_type_l1_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_pet_l2 ON provider_profiles(pet_type_l2_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_business_l3 ON role_applications(business_category_l3_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_pet_l1 ON role_applications(pet_type_l1_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_pet_l2 ON role_applications(pet_type_l2_id);

UPDATE master_items
SET metadata = json_set(COALESCE(NULLIF(metadata, ''), '{}'), '$.item_level', 'l1')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'business_category' LIMIT 1)
  AND parent_item_id IS NULL
  AND code IN ('hospital', 'grooming', 'pet_shop', 'pet_hotel', 'training');

UPDATE master_items
SET metadata = json_set(COALESCE(NULLIF(metadata, ''), '{}'), '$.item_level', 'l2')
WHERE category_id = (SELECT id FROM master_categories WHERE code = 'business_category' LIMIT 1)
  AND parent_item_id IS NOT NULL;

WITH style_seeds(item_id, code, business_code, pet_l1_code, pet_l2_code, sort_order) AS (
  VALUES
    ('mi-business-style-grooming-dog-poodle-continental-clip', 'grooming_dog_poodle_continental_clip', 'grooming', 'dog', 'poodle', 3001),
    ('mi-business-style-grooming-dog-poodle-teddy-bear-cut', 'grooming_dog_poodle_teddy_bear_cut', 'grooming', 'dog', 'poodle', 3002),
    ('mi-business-style-grooming-dog-poodle-lamb-clip', 'grooming_dog_poodle_lamb_clip', 'grooming', 'dog', 'poodle', 3003),
    ('mi-business-style-grooming-dog-poodle-puppy-clip', 'grooming_dog_poodle_puppy_clip', 'grooming', 'dog', 'poodle', 3004),
    ('mi-business-style-grooming-dog-poodle-face-cut', 'grooming_dog_poodle_face_cut', 'grooming', 'dog', 'poodle', 3005),
    ('mi-business-style-grooming-dog-poodle-hygienic-grooming', 'grooming_dog_poodle_hygienic_grooming', 'grooming', 'dog', 'poodle', 3006),
    ('mi-business-style-grooming-dog-maltese-round-cut', 'grooming_dog_maltese_round_cut', 'grooming', 'dog', 'maltese', 3101),
    ('mi-business-style-grooming-dog-maltese-puppy-cut', 'grooming_dog_maltese_puppy_cut', 'grooming', 'dog', 'maltese', 3102),
    ('mi-business-style-grooming-dog-maltese-ear-trim', 'grooming_dog_maltese_ear_trim', 'grooming', 'dog', 'maltese', 3103),
    ('mi-business-style-grooming-dog-maltese-hygienic-grooming', 'grooming_dog_maltese_hygienic_grooming', 'grooming', 'dog', 'maltese', 3104),
    ('mi-business-style-grooming-cat-persian-lion-cut', 'grooming_cat_persian_lion_cut', 'grooming', 'cat', 'persian', 3201),
    ('mi-business-style-grooming-cat-persian-belly-shave', 'grooming_cat_persian_belly_shave', 'grooming', 'cat', 'persian', 3202),
    ('mi-business-style-grooming-cat-persian-face-trim', 'grooming_cat_persian_face_trim', 'grooming', 'cat', 'persian', 3203),
    ('mi-business-style-grooming-cat-persian-de-shedding-care', 'grooming_cat_persian_de_shedding_care', 'grooming', 'cat', 'persian', 3204),
    ('mi-business-style-training-dog-poodle-basic-manners', 'training_dog_poodle_basic_manners', 'training', 'dog', 'poodle', 3301),
    ('mi-business-style-training-dog-poodle-walking-balance', 'training_dog_poodle_walking_balance', 'training', 'dog', 'poodle', 3302),
    ('mi-business-style-training-dog-poodle-separation-anxiety-care', 'training_dog_poodle_separation_anxiety_care', 'training', 'dog', 'poodle', 3303),
    ('mi-business-style-hospital-dog-poodle-dental-scaling', 'hospital_dog_poodle_dental_scaling', 'hospital', 'dog', 'poodle', 3401),
    ('mi-business-style-hospital-dog-poodle-patella-checkup', 'hospital_dog_poodle_patella_checkup', 'hospital', 'dog', 'poodle', 3402),
    ('mi-business-style-hospital-dog-poodle-skin-ear-exam', 'hospital_dog_poodle_skin_ear_exam', 'hospital', 'dog', 'poodle', 3403)
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  s.item_id,
  bc.id,
  NULL,
  s.code,
  s.sort_order,
  'active',
  json_object(
    'item_level', 'l3_style',
    'business_category_l1_id', business_l1.id,
    'pet_type_l1_id', pet_l1.id,
    'pet_type_l2_id', pet_l2.id
  ),
  datetime('now'),
  datetime('now')
FROM style_seeds s
JOIN master_categories bc ON bc.code = 'business_category'
JOIN master_items business_l1 ON business_l1.category_id = bc.id AND business_l1.code = s.business_code
JOIN master_categories ptc ON ptc.code = 'pet_type'
JOIN master_items pet_l1 ON pet_l1.category_id = ptc.id AND pet_l1.code = s.pet_l1_code
JOIN master_items pet_l2 ON pet_l2.category_id = ptc.id AND pet_l2.code = s.pet_l2_code;

WITH style_i18n(code, ko, en) AS (
  VALUES
    ('grooming_dog_poodle_continental_clip', '콘티넨털 클립', 'Continental Clip'),
    ('grooming_dog_poodle_teddy_bear_cut', '테디베어 컷', 'Teddy Bear Cut'),
    ('grooming_dog_poodle_lamb_clip', '램 클립', 'Lamb Clip'),
    ('grooming_dog_poodle_puppy_clip', '퍼피 클립', 'Puppy Clip'),
    ('grooming_dog_poodle_face_cut', '페이스 컷', 'Face Cut'),
    ('grooming_dog_poodle_hygienic_grooming', '위생미용', 'Hygienic Grooming'),
    ('grooming_dog_maltese_round_cut', '말티즈 라운드 컷', 'Maltese Round Cut'),
    ('grooming_dog_maltese_puppy_cut', '말티즈 퍼피 컷', 'Maltese Puppy Cut'),
    ('grooming_dog_maltese_ear_trim', '귀 라인 정리', 'Ear Trim'),
    ('grooming_dog_maltese_hygienic_grooming', '위생미용', 'Hygienic Grooming'),
    ('grooming_cat_persian_lion_cut', '라이언 컷', 'Lion Cut'),
    ('grooming_cat_persian_belly_shave', '배 털 정리', 'Belly Shave'),
    ('grooming_cat_persian_face_trim', '페이스 트림', 'Face Trim'),
    ('grooming_cat_persian_de_shedding_care', '죽은털 관리', 'De-shedding Care'),
    ('training_dog_poodle_basic_manners', '기본 예절 훈련', 'Basic Manners Training'),
    ('training_dog_poodle_walking_balance', '산책 밸런스 훈련', 'Walking Balance Training'),
    ('training_dog_poodle_separation_anxiety_care', '분리불안 케어', 'Separation Anxiety Care'),
    ('hospital_dog_poodle_dental_scaling', '치아 스케일링 상담', 'Dental Scaling Consultation'),
    ('hospital_dog_poodle_patella_checkup', '슬개골 체크업', 'Patella Checkup'),
    ('hospital_dog_poodle_skin_ear_exam', '피부/귀 검진', 'Skin and Ear Exam')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  'master.business_category.' || code,
  'master',
  ko,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  en,
  1,
  datetime('now'),
  datetime('now')
FROM style_i18n;

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0082_business_style_seed_and_links');
