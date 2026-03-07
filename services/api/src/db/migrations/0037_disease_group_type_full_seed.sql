-- 0037: Disease Group (L1) + Disease History Type (L2) full seed
-- Legacy schema compatible: master_categories.key / master_items.key / parent_id / status

UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE key IN ('disease_group', 'disease_type');

-- L1 disease groups
WITH groups(id, key, sort_order, ko, en) AS (
  VALUES
    ('mi-dg-endocrine-disease', 'endocrine_disease', 1, '내분비질환', 'Endocrine Disease'),
    ('mi-dg-cardiovascular-disease', 'cardiovascular_disease', 2, '심혈관 질환', 'Cardiovascular Disease'),
    ('mi-dg-respiratory-disease', 'respiratory_disease', 3, '호흡기 질환', 'Respiratory Disease'),
    ('mi-dg-digestive-disease', 'digestive_disease', 4, '소화기 질환', 'Digestive Disease'),
    ('mi-dg-urinary-disease', 'urinary_disease', 5, '비뇨기 질환', 'Urinary Disease'),
    ('mi-dg-kidney-disease', 'kidney_disease', 6, '신장 질환', 'Kidney Disease'),
    ('mi-dg-liver-disease', 'liver_disease', 7, '간 질환', 'Liver Disease'),
    ('mi-dg-skin-disease', 'skin_disease', 8, '피부 질환', 'Skin Disease'),
    ('mi-dg-eye-disease', 'eye_disease', 9, '안과 질환', 'Eye Disease'),
    ('mi-dg-ear-disease', 'ear_disease', 10, '귀 질환', 'Ear Disease'),
    ('mi-dg-dental-disease', 'dental_disease', 11, '치과 질환', 'Dental Disease'),
    ('mi-dg-neurological-disease', 'neurological_disease', 12, '신경계 질환', 'Neurological Disease'),
    ('mi-dg-musculoskeletal-disease', 'musculoskeletal_disease', 13, '근골격계 질환', 'Musculoskeletal Disease'),
    ('mi-dg-immune-disease', 'immune_disease', 14, '면역 질환', 'Immune Disease'),
    ('mi-dg-infectious-disease', 'infectious_disease', 15, '감염성 질환', 'Infectious Disease'),
    ('mi-dg-parasitic-disease', 'parasitic_disease', 16, '기생충 질환', 'Parasitic Disease'),
    ('mi-dg-metabolic-disease', 'metabolic_disease', 17, '대사 질환', 'Metabolic Disease'),
    ('mi-dg-reproductive-disease', 'reproductive_disease', 18, '생식기 질환', 'Reproductive Disease'),
    ('mi-dg-genetic-disease', 'genetic_disease', 19, '유전 질환', 'Genetic Disease'),
    ('mi-dg-cancer-disease', 'cancer_disease', 20, '종양 질환', 'Cancer'),
    ('mi-dg-behavioral-disease', 'behavioral_disease', 21, '행동 질환', 'Behavioral Disorder'),
    ('mi-dg-nutritional-disease', 'nutritional_disease', 22, '영양 질환', 'Nutritional Disorder')
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_id, key, sort_order, status, metadata, created_at, updated_at
)
SELECT
  g.id,
  c.id,
  NULL,
  g.key,
  g.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM groups g
JOIN master_categories c ON c.key = 'disease_group';

-- L2 disease types
WITH diseases(id, group_key, key, sort_order, ko, en) AS (
  VALUES
    ('mi-dt-diabetes-mellitus', 'endocrine_disease', 'diabetes_mellitus', 101, '당뇨병', 'Diabetes Mellitus'),
    ('mi-dt-hypothyroidism', 'endocrine_disease', 'hypothyroidism', 102, '갑상선 기능저하증', 'Hypothyroidism'),
    ('mi-dt-hyperthyroidism', 'endocrine_disease', 'hyperthyroidism', 103, '갑상선 기능항진증', 'Hyperthyroidism'),
    ('mi-dt-cushing-syndrome', 'endocrine_disease', 'cushing_syndrome', 104, '쿠싱증후군', 'Cushing Syndrome'),
    ('mi-dt-addison-disease', 'endocrine_disease', 'addison_disease', 105, '애디슨병', 'Addison Disease'),
    ('mi-dt-insulin-resistance', 'endocrine_disease', 'insulin_resistance', 106, '인슐린 저항성', 'Insulin Resistance'),
    ('mi-dt-pituitary-tumor', 'endocrine_disease', 'pituitary_tumor', 107, '뇌하수체 종양', 'Pituitary Tumor'),
    ('mi-dt-thyroid-tumor', 'endocrine_disease', 'thyroid_tumor', 108, '갑상선 종양', 'Thyroid Tumor'),
    ('mi-dt-adrenal-tumor', 'endocrine_disease', 'adrenal_tumor', 109, '부신 종양', 'Adrenal Tumor'),
    ('mi-dt-heart-failure', 'cardiovascular_disease', 'heart_failure', 201, '심부전', 'Heart Failure'),
    ('mi-dt-heart-murmur', 'cardiovascular_disease', 'heart_murmur', 202, '심잡음', 'Heart Murmur'),
    ('mi-dt-dilated-cardiomyopathy', 'cardiovascular_disease', 'dilated_cardiomyopathy', 203, '확장성 심근증', 'Dilated Cardiomyopathy'),
    ('mi-dt-hypertrophic-cardiomyopathy', 'cardiovascular_disease', 'hypertrophic_cardiomyopathy', 204, '비대성 심근증', 'Hypertrophic Cardiomyopathy'),
    ('mi-dt-arrhythmia', 'cardiovascular_disease', 'arrhythmia', 205, '부정맥', 'Arrhythmia'),
    ('mi-dt-hypertension', 'cardiovascular_disease', 'hypertension', 206, '고혈압', 'Hypertension'),
    ('mi-dt-pulmonary-hypertension', 'cardiovascular_disease', 'pulmonary_hypertension', 207, '폐고혈압', 'Pulmonary Hypertension'),
    ('mi-dt-asthma', 'respiratory_disease', 'asthma', 301, '천식', 'Asthma'),
    ('mi-dt-pneumonia', 'respiratory_disease', 'pneumonia', 302, '폐렴', 'Pneumonia'),
    ('mi-dt-bronchitis', 'respiratory_disease', 'bronchitis', 303, '기관지염', 'Bronchitis'),
    ('mi-dt-tracheal-collapse', 'respiratory_disease', 'tracheal_collapse', 304, '기관허탈', 'Tracheal Collapse'),
    ('mi-dt-respiratory-infection', 'respiratory_disease', 'respiratory_infection', 305, '호흡기 감염', 'Respiratory Infection'),
    ('mi-dt-rhinitis', 'respiratory_disease', 'rhinitis', 306, '비염', 'Rhinitis'),
    ('mi-dt-gastritis', 'digestive_disease', 'gastritis', 401, '위염', 'Gastritis'),
    ('mi-dt-enteritis', 'digestive_disease', 'enteritis', 402, '장염', 'Enteritis'),
    ('mi-dt-pancreatitis', 'digestive_disease', 'pancreatitis', 403, '췌장염', 'Pancreatitis'),
    ('mi-dt-inflammatory-bowel-disease', 'digestive_disease', 'inflammatory_bowel_disease', 404, '염증성 장질환', 'Inflammatory Bowel Disease'),
    ('mi-dt-gastroenteritis', 'digestive_disease', 'gastroenteritis', 405, '위장염', 'Gastroenteritis'),
    ('mi-dt-constipation', 'digestive_disease', 'constipation', 406, '변비', 'Constipation'),
    ('mi-dt-colitis', 'digestive_disease', 'colitis', 407, '대장염', 'Colitis'),
    ('mi-dt-cystitis', 'urinary_disease', 'cystitis', 501, '방광염', 'Cystitis'),
    ('mi-dt-urinary-stone', 'urinary_disease', 'urinary_stone', 502, '요로결석', 'Urinary Stone'),
    ('mi-dt-urinary-infection', 'urinary_disease', 'urinary_infection', 503, '요로 감염', 'Urinary Infection'),
    ('mi-dt-incontinence', 'urinary_disease', 'incontinence', 504, '요실금', 'Incontinence'),
    ('mi-dt-kidney-failure', 'kidney_disease', 'kidney_failure', 601, '신부전', 'Kidney Failure'),
    ('mi-dt-chronic-kidney-disease', 'kidney_disease', 'chronic_kidney_disease', 602, '만성 신장질환', 'Chronic Kidney Disease'),
    ('mi-dt-acute-kidney-injury', 'kidney_disease', 'acute_kidney_injury', 603, '급성 신손상', 'Acute Kidney Injury'),
    ('mi-dt-pyelonephritis', 'kidney_disease', 'pyelonephritis', 604, '신우신염', 'Pyelonephritis'),
    ('mi-dt-proteinuria', 'kidney_disease', 'proteinuria', 605, '단백뇨', 'Proteinuria'),
    ('mi-dt-hepatitis', 'liver_disease', 'hepatitis', 701, '간염', 'Hepatitis'),
    ('mi-dt-liver-failure', 'liver_disease', 'liver_failure', 702, '간부전', 'Liver Failure'),
    ('mi-dt-fatty-liver', 'liver_disease', 'fatty_liver', 703, '지방간', 'Fatty Liver'),
    ('mi-dt-cholangitis', 'liver_disease', 'cholangitis', 704, '담관염', 'Cholangitis'),
    ('mi-dt-gallbladder-mucocele', 'liver_disease', 'gallbladder_mucocele', 705, '담낭점액종', 'Gallbladder Mucocele'),
    ('mi-dt-dermatitis', 'skin_disease', 'dermatitis', 801, '피부염', 'Dermatitis'),
    ('mi-dt-atopic-dermatitis', 'skin_disease', 'atopic_dermatitis', 802, '아토피 피부염', 'Atopic Dermatitis'),
    ('mi-dt-fungal-infection', 'skin_disease', 'fungal_infection', 803, '곰팡이 감염', 'Fungal Infection'),
    ('mi-dt-bacterial-skin-infection', 'skin_disease', 'bacterial_skin_infection', 804, '세균성 피부 감염', 'Bacterial Skin Infection'),
    ('mi-dt-allergic-skin-disease', 'skin_disease', 'allergic_skin_disease', 805, '알러지성 피부질환', 'Allergic Skin Disease'),
    ('mi-dt-pyoderma', 'skin_disease', 'pyoderma', 806, '농피증', 'Pyoderma'),
    ('mi-dt-cataract', 'eye_disease', 'cataract', 901, '백내장', 'Cataract'),
    ('mi-dt-glaucoma', 'eye_disease', 'glaucoma', 902, '녹내장', 'Glaucoma'),
    ('mi-dt-conjunctivitis', 'eye_disease', 'conjunctivitis', 903, '결막염', 'Conjunctivitis'),
    ('mi-dt-dry-eye', 'eye_disease', 'dry_eye', 904, '안구건조증', 'Dry Eye'),
    ('mi-dt-corneal-ulcer', 'eye_disease', 'corneal_ulcer', 905, '각막궤양', 'Corneal Ulcer'),
    ('mi-dt-otitis-externa', 'ear_disease', 'otitis_externa', 1001, '외이염', 'Otitis Externa'),
    ('mi-dt-otitis-media', 'ear_disease', 'otitis_media', 1002, '중이염', 'Otitis Media'),
    ('mi-dt-ear-mite-infestation', 'ear_disease', 'ear_mite_infestation', 1003, '귀진드기 감염', 'Ear Mite Infestation'),
    ('mi-dt-periodontal-disease', 'dental_disease', 'periodontal_disease', 1101, '치주질환', 'Periodontal Disease'),
    ('mi-dt-gingivitis', 'dental_disease', 'gingivitis', 1102, '치은염', 'Gingivitis'),
    ('mi-dt-tooth-fracture', 'dental_disease', 'tooth_fracture', 1103, '치아 파절', 'Tooth Fracture'),
    ('mi-dt-stomatitis', 'dental_disease', 'stomatitis', 1104, '구내염', 'Stomatitis'),
    ('mi-dt-seizure-disorder', 'neurological_disease', 'seizure_disorder', 1201, '발작질환', 'Seizure Disorder'),
    ('mi-dt-epilepsy', 'neurological_disease', 'epilepsy', 1202, '간질', 'Epilepsy'),
    ('mi-dt-vestibular-disease', 'neurological_disease', 'vestibular_disease', 1203, '전정질환', 'Vestibular Disease'),
    ('mi-dt-meningitis', 'neurological_disease', 'meningitis', 1204, '수막염', 'Meningitis'),
    ('mi-dt-arthritis', 'musculoskeletal_disease', 'arthritis', 1301, '관절염', 'Arthritis'),
    ('mi-dt-patellar-luxation', 'musculoskeletal_disease', 'patellar_luxation', 1302, '슬개골 탈구', 'Patellar Luxation'),
    ('mi-dt-hip-dysplasia', 'musculoskeletal_disease', 'hip_dysplasia', 1303, '고관절 이형성증', 'Hip Dysplasia'),
    ('mi-dt-ivdd', 'musculoskeletal_disease', 'ivdd', 1304, '디스크 질환', 'Intervertebral Disc Disease'),
    ('mi-dt-immune-mediated-anemia', 'immune_disease', 'immune_mediated_anemia', 1401, '면역매개성 빈혈', 'Immune-Mediated Anemia'),
    ('mi-dt-immune-mediated-thrombocytopenia', 'immune_disease', 'immune_mediated_thrombocytopenia', 1402, '면역매개성 혈소판감소증', 'Immune-Mediated Thrombocytopenia'),
    ('mi-dt-lupus', 'immune_disease', 'lupus', 1403, '루푸스', 'Lupus'),
    ('mi-dt-parvovirus', 'infectious_disease', 'parvovirus', 1501, '파보바이러스', 'Parvovirus'),
    ('mi-dt-distemper', 'infectious_disease', 'distemper', 1502, '디스템퍼', 'Distemper'),
    ('mi-dt-kennel-cough', 'infectious_disease', 'kennel_cough', 1503, '켄넬코프', 'Kennel Cough'),
    ('mi-dt-leptospirosis', 'infectious_disease', 'leptospirosis', 1504, '렙토스피라증', 'Leptospirosis'),
    ('mi-dt-heartworm', 'infectious_disease', 'heartworm', 1505, '심장사상충', 'Heartworm'),
    ('mi-dt-flea-infestation', 'parasitic_disease', 'flea_infestation', 1601, '벼룩 감염', 'Flea Infestation'),
    ('mi-dt-tick-infestation', 'parasitic_disease', 'tick_infestation', 1602, '진드기 감염', 'Tick Infestation'),
    ('mi-dt-mange', 'parasitic_disease', 'mange', 1603, '옴', 'Mange'),
    ('mi-dt-intestinal-parasites', 'parasitic_disease', 'intestinal_parasites', 1604, '장내 기생충', 'Intestinal Parasites'),
    ('mi-dt-obesity', 'metabolic_disease', 'obesity', 1701, '비만', 'Obesity'),
    ('mi-dt-hyperlipidemia', 'metabolic_disease', 'hyperlipidemia', 1702, '고지혈증', 'Hyperlipidemia'),
    ('mi-dt-ketoacidosis', 'metabolic_disease', 'ketoacidosis', 1703, '케톤산증', 'Ketoacidosis'),
    ('mi-dt-pyometra', 'reproductive_disease', 'pyometra', 1801, '자궁축농증', 'Pyometra'),
    ('mi-dt-mastitis', 'reproductive_disease', 'mastitis', 1802, '유선염', 'Mastitis'),
    ('mi-dt-prostatitis', 'reproductive_disease', 'prostatitis', 1803, '전립선염', 'Prostatitis'),
    ('mi-dt-congenital-heart-defect', 'genetic_disease', 'congenital_heart_defect', 1901, '선천성 심장질환', 'Congenital Heart Defect'),
    ('mi-dt-inherited-blindness', 'genetic_disease', 'inherited_blindness', 1902, '유전성 실명', 'Inherited Blindness'),
    ('mi-dt-congenital-deafness', 'genetic_disease', 'congenital_deafness', 1903, '선천성 청각장애', 'Congenital Deafness'),
    ('mi-dt-lymphoma', 'cancer_disease', 'lymphoma', 2001, '림프종', 'Lymphoma'),
    ('mi-dt-mast-cell-tumor', 'cancer_disease', 'mast_cell_tumor', 2002, '비만세포종', 'Mast Cell Tumor'),
    ('mi-dt-melanoma', 'cancer_disease', 'melanoma', 2003, '흑색종', 'Melanoma'),
    ('mi-dt-osteosarcoma', 'cancer_disease', 'osteosarcoma', 2004, '골육종', 'Osteosarcoma'),
    ('mi-dt-separation-anxiety', 'behavioral_disease', 'separation_anxiety', 2101, '분리불안', 'Separation Anxiety'),
    ('mi-dt-compulsive-disorder', 'behavioral_disease', 'compulsive_disorder', 2102, '강박행동장애', 'Compulsive Disorder'),
    ('mi-dt-aggression-disorder', 'behavioral_disease', 'aggression_disorder', 2103, '공격성 문제', 'Aggression Disorder'),
    ('mi-dt-malnutrition', 'nutritional_disease', 'malnutrition', 2201, '영양실조', 'Malnutrition'),
    ('mi-dt-vitamin-deficiency', 'nutritional_disease', 'vitamin_deficiency', 2202, '비타민 결핍', 'Vitamin Deficiency'),
    ('mi-dt-mineral-imbalance', 'nutritional_disease', 'mineral_imbalance', 2203, '미네랄 불균형', 'Mineral Imbalance')
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_id, key, sort_order, status, metadata, created_at, updated_at
)
SELECT
  d.id,
  c2.id,
  g.id,
  d.key,
  d.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM diseases d
JOIN master_categories c2 ON c2.key = 'disease_type'
JOIN master_items g
  ON g.key = d.group_key
 AND g.category_id = (SELECT id FROM master_categories WHERE key = 'disease_group' LIMIT 1);

-- i18n minimal upsert
WITH keys AS (
  SELECT DISTINCT 'master.disease_group.' || key AS i18n_key FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE key='disease_group' LIMIT 1)
  UNION
  SELECT DISTINCT 'master.disease_type.' || key AS i18n_key FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE key='disease_type' LIMIT 1)
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  i18n_key,
  'master',
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  i18n_key,
  1,
  datetime('now'),
  datetime('now')
FROM keys;
