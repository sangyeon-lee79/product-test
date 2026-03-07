-- 0038: Cleanup and Reseed Disease Group (L1) and Disease Type (L2)
-- Goal: Fix mixed translation keys and ensure correct L1-L2 parent-child linking.
-- Fix: Handle foreign key constraints by cleaning up referencing tables first.

-- 1. CLEANUP referencing tables to avoid FOREIGN KEY constraint failures
-- These tables reference master_items(id) for disease_group or disease_type
DELETE FROM pet_disease_histories 
WHERE disease_group_item_id IN (SELECT id FROM master_items WHERE category_id IN (SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')))
   OR disease_item_id IN (SELECT id FROM master_items WHERE category_id IN (SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')));

DELETE FROM pet_disease_devices 
WHERE disease_item_id IN (SELECT id FROM master_items WHERE category_id IN (SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')));

DELETE FROM pet_glucose_logs 
WHERE disease_item_id IN (SELECT id FROM master_items WHERE category_id IN (SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')));

DELETE FROM disease_judgement_rules 
WHERE disease_item_id IN (SELECT id FROM master_items WHERE category_id IN (SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')));


-- 2. DELETE existing data for L1 (disease_group) and L2 (disease_type) from master_items
DELETE FROM master_items 
WHERE category_id IN (
    SELECT id FROM master_categories WHERE code IN ('disease_group', 'disease_type')
);

-- Delete related i18n keys
DELETE FROM i18n_translations 
WHERE key LIKE 'master.disease_group.%' 
   OR key LIKE 'master.disease_type.%';


-- 3. SEED L1 (disease_group)
WITH l1_data(id, code, sort_order, ko, en) AS (
  VALUES
    ('mi-dg-endocrine', 'endocrine_disease', 1, '내분비 질환', 'Endocrine Disease'),
    ('mi-dg-cardiovascular', 'cardiovascular_disease', 2, '심혈관 질환', 'Cardiovascular Disease'),
    ('mi-dg-respiratory', 'respiratory_disease', 3, '호흡기 질환', 'Respiratory Disease'),
    ('mi-dg-digestive', 'digestive_disease', 4, '소화기 질환', 'Digestive Disease'),
    ('mi-dg-kidney', 'kidney_disease', 5, '신장 질환', 'Kidney Disease'),
    ('mi-dg-urinary', 'urinary_disease', 6, '비뇨기 질환', 'Urinary Disease'),
    ('mi-dg-skin', 'skin_disease', 7, '피부 질환', 'Skin Disease'),
    ('mi-dg-eye', 'eye_disease', 8, '안과 질환', 'Eye Disease'),
    ('mi-dg-ear', 'ear_disease', 9, '귀 질환', 'Ear Disease'),
    ('mi-dg-dental', 'dental_disease', 10, '치과 질환', 'Dental Disease'),
    ('mi-dg-neurological', 'neurological_disease', 11, '신경 질환', 'Neurological Disease'),
    ('mi-dg-musculoskeletal', 'musculoskeletal_disease', 12, '근골격 질환', 'Musculoskeletal Disease'),
    ('mi-dg-infectious', 'infectious_disease', 13, '감염 질환', 'Infectious Disease'),
    ('mi-dg-parasitic', 'parasitic_disease', 14, '기생충 질환', 'Parasitic Disease'),
    ('mi-dg-metabolic', 'metabolic_disease', 15, '대사 질환', 'Metabolic Disease'),
    ('mi-dg-reproductive', 'reproductive_disease', 16, '생식 질환', 'Reproductive Disease'),
    ('mi-dg-genetic', 'genetic_disease', 17, '유전 질환', 'Genetic Disease'),
    ('mi-dg-cancer', 'cancer_disease', 18, '종양 질환', 'Cancer'),
    ('mi-dg-behavioral', 'behavioral_disease', 19, '행동 질환', 'Behavioral Disorder'),
    ('mi-dg-nutritional', 'nutritional_disease', 20, '영양 질환', 'Nutritional Disorder')
)
INSERT INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT d.id, c.id, NULL, d.code, d.sort_order, 'active', '{}', datetime('now'), datetime('now')
FROM l1_data d JOIN master_categories c ON c.code = 'disease_group';

INSERT INTO i18n_translations (id, key, page, ko, en, is_active, created_at, updated_at)
SELECT 'i18n-dg-' || code, 'master.disease_group.' || code, 'master', ko, en, 1, datetime('now'), datetime('now')
FROM (
  VALUES
    ('endocrine_disease', '내분비 질환', 'Endocrine Disease'),
    ('cardiovascular_disease', '심혈관 질환', 'Cardiovascular Disease'),
    ('respiratory_disease', '호흡기 질환', 'Respiratory Disease'),
    ('digestive_disease', '소화기 질환', 'Digestive Disease'),
    ('kidney_disease', '신장 질환', 'Kidney Disease'),
    ('urinary_disease', '비뇨기 질환', 'Urinary Disease'),
    ('skin_disease', '피부 질환', 'Skin Disease'),
    ('eye_disease', '안과 질환', 'Eye Disease'),
    ('ear_disease', '귀 질환', 'Ear Disease'),
    ('dental_disease', '치과 질환', 'Dental Disease'),
    ('neurological_disease', '신경 질환', 'Neurological Disease'),
    ('musculoskeletal_disease', '근골격 질환', 'Musculoskeletal Disease'),
    ('infectious_disease', '감염 질환', 'Infectious Disease'),
    ('parasitic_disease', '기생충 질환', 'Parasitic Disease'),
    ('metabolic_disease', '대사 질환', 'Metabolic Disease'),
    ('reproductive_disease', '생식 질환', 'Reproductive Disease'),
    ('genetic_disease', '유전 질환', 'Genetic Disease'),
    ('cancer_disease', '종양 질환', 'Cancer'),
    ('behavioral_disease', '행동 질환', 'Behavioral Disorder'),
    ('nutritional_disease', '영양 질환', 'Nutritional Disorder')
) AS t(code, ko, en);


-- 4. SEED L2 (disease_type)
WITH l2_data(id, parent_code, code, sort_order, ko, en) AS (
  VALUES
    ('mi-dt-asthma', 'respiratory_disease', 'asthma', 1, '천식', 'Asthma'),
    ('mi-dt-pneumonia', 'respiratory_disease', 'pneumonia', 2, '폐렴', 'Pneumonia'),
    ('mi-dt-bronchitis', 'respiratory_disease', 'bronchitis', 3, '기관지염', 'Bronchitis'),
    ('mi-dt-tracheal_collapse', 'respiratory_disease', 'tracheal_collapse', 4, '기관허탈', 'Tracheal Collapse'),
    ('mi-dt-rhinitis', 'respiratory_disease', 'rhinitis', 5, '비염', 'Rhinitis'),
    ('mi-dt-diabetes', 'endocrine_disease', 'diabetes', 1, '당뇨', 'Diabetes'),
    ('mi-dt-hypothyroidism', 'endocrine_disease', 'hypothyroidism', 2, '갑상선 기능저하증', 'Hypothyroidism'),
    ('mi-dt-hyperthyroidism', 'endocrine_disease', 'hyperthyroidism', 3, '갑상선 기능항진증', 'Hyperthyroidism'),
    ('mi-dt-cushing', 'endocrine_disease', 'cushing', 4, '쿠싱 증후군', 'Cushing Syndrome'),
    ('mi-dt-addison', 'endocrine_disease', 'addison', 5, '애디슨병', 'Addison Disease'),
    ('mi-dt-gastritis', 'digestive_disease', 'gastritis', 1, '위염', 'Gastritis'),
    ('mi-dt-enteritis', 'digestive_disease', 'enteritis', 2, '장염', 'Enteritis'),
    ('mi-dt-pancreatitis', 'digestive_disease', 'pancreatitis', 3, '췌장염', 'Pancreatitis'),
    ('mi-dt-colitis', 'digestive_disease', 'colitis', 4, '대장염', 'Colitis')
)
INSERT INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT d.id, c.id, p.id, d.code, d.sort_order, 'active', '{}', datetime('now'), datetime('now')
FROM l2_data d
JOIN master_categories c ON c.code = 'disease_type'
JOIN master_items p ON p.code = d.parent_code AND p.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group');

INSERT INTO i18n_translations (id, key, page, ko, en, is_active, created_at, updated_at)
SELECT 'i18n-dt-' || code, 'master.disease_type.' || code, 'master', ko, en, 1, datetime('now'), datetime('now')
FROM (
  VALUES
    ('asthma', '천식', 'Asthma'),
    ('pneumonia', '폐렴', 'Pneumonia'),
    ('bronchitis', '기관지염', 'Bronchitis'),
    ('tracheal_collapse', '기관허탈', 'Tracheal Collapse'),
    ('rhinitis', '비염', 'Rhinitis'),
    ('diabetes', '당뇨', 'Diabetes'),
    ('hypothyroidism', '갑상선 기능저하증', 'Hypothyroidism'),
    ('hyperthyroidism', '갑상선 기능항진증', 'Hyperthyroidism'),
    ('cushing', '쿠싱 증후군', 'Cushing Syndrome'),
    ('addison', '애디슨병', 'Addison Disease'),
    ('gastritis', '위염', 'Gastritis'),
    ('enteritis', '장염', 'Enteritis'),
    ('pancreatitis', '췌장염', 'Pancreatitis'),
    ('colitis', '대장염', 'Colitis')
) AS t(code, ko, en);
