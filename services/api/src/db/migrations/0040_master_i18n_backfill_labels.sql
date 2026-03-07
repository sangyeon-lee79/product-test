-- 0040: Master i18n backfill (no raw key rendering)
-- 목적:
-- 1) master 카테고리/아이템 i18n row 누락분 생성
-- 2) ko/en 이 비어있거나 master.* key 문자열인 경우 표시 라벨로 보정
-- 3) disease_group / disease_type 는 명시 번역 우선 반영

-- A. category i18n row 생성
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  ('master.' || mc.code),
  'master',
  REPLACE(mc.code, '_', ' '),
  REPLACE(mc.code, '_', ' '),
  1,
  datetime('now'),
  datetime('now')
FROM master_categories mc;

-- B. item i18n row 생성
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  ('master.' || mc.code || '.' || mi.code),
  'master',
  REPLACE(mi.code, '_', ' '),
  REPLACE(mi.code, '_', ' '),
  1,
  datetime('now'),
  datetime('now')
FROM master_items mi
JOIN master_categories mc ON mc.id = mi.category_id;

-- C. category 기본 번역 보정
WITH cat_map(code, ko, en) AS (
  VALUES
    ('disease_group', '질병군', 'Disease Group'),
    ('disease_type', '질병', 'Disease Type'),
    ('disease_device_type', '질병장치', 'Disease Device'),
    ('disease_measurement_type', '질병측정항목', 'Disease Measurement'),
    ('disease_measurement_context', '질병측정컨텍스트', 'Disease Measurement Context'),
    ('disease_judgement_rule_type', '질병판단기준', 'Disease Judgement Rule'),
    ('diet_type', '식단유형', 'Diet Type'),
    ('diet_subtype', '식단하위유형', 'Diet Subtype'),
    ('allergy_group', '알러지그룹', 'Allergy Group'),
    ('allergy_type', '알러지유형', 'Allergy Type'),
    ('pet_type', '펫종류', 'Pet Type')
)
UPDATE i18n_translations
SET
  ko = COALESCE((SELECT m.ko FROM cat_map m WHERE ('master.' || m.code) = i18n_translations.key), ko),
  en = COALESCE((SELECT m.en FROM cat_map m WHERE ('master.' || m.code) = i18n_translations.key), en),
  updated_at = datetime('now')
WHERE key IN (SELECT 'master.' || code FROM cat_map);

-- D. disease_group 명시 번역
WITH grp(code, ko, en) AS (
  VALUES
    ('endocrine_disease', '내분비질환', 'Endocrine Disease'),
    ('cardiovascular_disease', '심혈관 질환', 'Cardiovascular Disease'),
    ('respiratory_disease', '호흡기 질환', 'Respiratory Disease'),
    ('digestive_disease', '소화기 질환', 'Digestive Disease'),
    ('urinary_disease', '비뇨기 질환', 'Urinary Disease'),
    ('kidney_disease', '신장 질환', 'Kidney Disease'),
    ('liver_disease', '간 질환', 'Liver Disease'),
    ('skin_disease', '피부 질환', 'Skin Disease'),
    ('eye_disease', '안과 질환', 'Eye Disease'),
    ('ear_disease', '귀 질환', 'Ear Disease'),
    ('dental_disease', '치과 질환', 'Dental Disease'),
    ('neurological_disease', '신경계 질환', 'Neurological Disease'),
    ('musculoskeletal_disease', '근골격계 질환', 'Musculoskeletal Disease'),
    ('immune_disease', '면역 질환', 'Immune Disease'),
    ('infectious_disease', '감염성 질환', 'Infectious Disease'),
    ('parasitic_disease', '기생충 질환', 'Parasitic Disease'),
    ('metabolic_disease', '대사 질환', 'Metabolic Disease'),
    ('reproductive_disease', '생식기 질환', 'Reproductive Disease'),
    ('genetic_disease', '유전 질환', 'Genetic Disease'),
    ('cancer_disease', '종양 질환', 'Cancer'),
    ('behavioral_disease', '행동 질환', 'Behavioral Disorder'),
    ('nutritional_disease', '영양 질환', 'Nutritional Disorder')
)
UPDATE i18n_translations
SET
  ko = (SELECT g.ko FROM grp g WHERE ('master.disease_group.' || g.code) = i18n_translations.key),
  en = (SELECT g.en FROM grp g WHERE ('master.disease_group.' || g.code) = i18n_translations.key),
  updated_at = datetime('now')
WHERE key IN (SELECT 'master.disease_group.' || code FROM grp);

-- E. disease_type 명시 번역
WITH dt(code, ko, en) AS (
  VALUES
    ('diabetes_mellitus', '당뇨병', 'Diabetes Mellitus'),
    ('hypothyroidism', '갑상선 기능저하증', 'Hypothyroidism'),
    ('hyperthyroidism', '갑상선 기능항진증', 'Hyperthyroidism'),
    ('cushing_syndrome', '쿠싱증후군', 'Cushing Syndrome'),
    ('addison_disease', '애디슨병', 'Addison Disease'),
    ('insulin_resistance', '인슐린 저항성', 'Insulin Resistance'),
    ('pituitary_tumor', '뇌하수체 종양', 'Pituitary Tumor'),
    ('thyroid_tumor', '갑상선 종양', 'Thyroid Tumor'),
    ('adrenal_tumor', '부신 종양', 'Adrenal Tumor'),
    ('heart_failure', '심부전', 'Heart Failure'),
    ('heart_murmur', '심잡음', 'Heart Murmur'),
    ('dilated_cardiomyopathy', '확장성 심근증', 'Dilated Cardiomyopathy'),
    ('hypertrophic_cardiomyopathy', '비대성 심근증', 'Hypertrophic Cardiomyopathy'),
    ('arrhythmia', '부정맥', 'Arrhythmia'),
    ('hypertension', '고혈압', 'Hypertension'),
    ('pulmonary_hypertension', '폐고혈압', 'Pulmonary Hypertension'),
    ('asthma', '천식', 'Asthma'),
    ('pneumonia', '폐렴', 'Pneumonia'),
    ('bronchitis', '기관지염', 'Bronchitis'),
    ('tracheal_collapse', '기관허탈', 'Tracheal Collapse'),
    ('respiratory_infection', '호흡기 감염', 'Respiratory Infection'),
    ('rhinitis', '비염', 'Rhinitis'),
    ('gastritis', '위염', 'Gastritis'),
    ('enteritis', '장염', 'Enteritis'),
    ('pancreatitis', '췌장염', 'Pancreatitis'),
    ('inflammatory_bowel_disease', '염증성 장질환', 'Inflammatory Bowel Disease'),
    ('gastroenteritis', '위장염', 'Gastroenteritis'),
    ('constipation', '변비', 'Constipation'),
    ('colitis', '대장염', 'Colitis'),
    ('cystitis', '방광염', 'Cystitis'),
    ('urinary_stone', '요로결석', 'Urinary Stone'),
    ('urinary_infection', '요로 감염', 'Urinary Infection'),
    ('incontinence', '요실금', 'Incontinence'),
    ('kidney_failure', '신부전', 'Kidney Failure'),
    ('chronic_kidney_disease', '만성 신장질환', 'Chronic Kidney Disease'),
    ('acute_kidney_injury', '급성 신손상', 'Acute Kidney Injury'),
    ('pyelonephritis', '신우신염', 'Pyelonephritis'),
    ('proteinuria', '단백뇨', 'Proteinuria'),
    ('hepatitis', '간염', 'Hepatitis'),
    ('liver_failure', '간부전', 'Liver Failure'),
    ('fatty_liver', '지방간', 'Fatty Liver'),
    ('cholangitis', '담관염', 'Cholangitis'),
    ('gallbladder_mucocele', '담낭점액종', 'Gallbladder Mucocele'),
    ('dermatitis', '피부염', 'Dermatitis'),
    ('atopic_dermatitis', '아토피 피부염', 'Atopic Dermatitis'),
    ('fungal_infection', '곰팡이 감염', 'Fungal Infection'),
    ('bacterial_skin_infection', '세균성 피부 감염', 'Bacterial Skin Infection'),
    ('allergic_skin_disease', '알러지성 피부질환', 'Allergic Skin Disease'),
    ('pyoderma', '농피증', 'Pyoderma'),
    ('cataract', '백내장', 'Cataract'),
    ('glaucoma', '녹내장', 'Glaucoma'),
    ('conjunctivitis', '결막염', 'Conjunctivitis'),
    ('dry_eye', '안구건조증', 'Dry Eye'),
    ('corneal_ulcer', '각막궤양', 'Corneal Ulcer'),
    ('otitis_externa', '외이염', 'Otitis Externa'),
    ('otitis_media', '중이염', 'Otitis Media'),
    ('ear_mite_infestation', '귀진드기 감염', 'Ear Mite Infestation'),
    ('periodontal_disease', '치주질환', 'Periodontal Disease'),
    ('gingivitis', '치은염', 'Gingivitis'),
    ('tooth_fracture', '치아 파절', 'Tooth Fracture'),
    ('stomatitis', '구내염', 'Stomatitis'),
    ('seizure_disorder', '발작질환', 'Seizure Disorder'),
    ('epilepsy', '간질', 'Epilepsy'),
    ('vestibular_disease', '전정질환', 'Vestibular Disease'),
    ('meningitis', '수막염', 'Meningitis'),
    ('arthritis', '관절염', 'Arthritis'),
    ('patellar_luxation', '슬개골 탈구', 'Patellar Luxation'),
    ('hip_dysplasia', '고관절 이형성증', 'Hip Dysplasia'),
    ('ivdd', '디스크 질환', 'Intervertebral Disc Disease'),
    ('immune_mediated_anemia', '면역매개성 빈혈', 'Immune-Mediated Anemia'),
    ('immune_mediated_thrombocytopenia', '면역매개성 혈소판감소증', 'Immune-Mediated Thrombocytopenia'),
    ('lupus', '루푸스', 'Lupus'),
    ('parvovirus', '파보바이러스', 'Parvovirus'),
    ('distemper', '디스템퍼', 'Distemper'),
    ('kennel_cough', '켄넬코프', 'Kennel Cough'),
    ('leptospirosis', '렙토스피라증', 'Leptospirosis'),
    ('heartworm', '심장사상충', 'Heartworm'),
    ('flea_infestation', '벼룩 감염', 'Flea Infestation'),
    ('tick_infestation', '진드기 감염', 'Tick Infestation'),
    ('mange', '옴', 'Mange'),
    ('intestinal_parasites', '장내 기생충', 'Intestinal Parasites'),
    ('obesity', '비만', 'Obesity'),
    ('hyperlipidemia', '고지혈증', 'Hyperlipidemia'),
    ('ketoacidosis', '케톤산증', 'Ketoacidosis'),
    ('pyometra', '자궁축농증', 'Pyometra'),
    ('mastitis', '유선염', 'Mastitis'),
    ('prostatitis', '전립선염', 'Prostatitis'),
    ('congenital_heart_defect', '선천성 심장질환', 'Congenital Heart Defect'),
    ('inherited_blindness', '유전성 실명', 'Inherited Blindness'),
    ('congenital_deafness', '선천성 청각장애', 'Congenital Deafness'),
    ('lymphoma', '림프종', 'Lymphoma'),
    ('mast_cell_tumor', '비만세포종', 'Mast Cell Tumor'),
    ('melanoma', '흑색종', 'Melanoma'),
    ('osteosarcoma', '골육종', 'Osteosarcoma'),
    ('separation_anxiety', '분리불안', 'Separation Anxiety'),
    ('compulsive_disorder', '강박행동장애', 'Compulsive Disorder'),
    ('aggression_disorder', '공격성 문제', 'Aggression Disorder'),
    ('malnutrition', '영양실조', 'Malnutrition'),
    ('vitamin_deficiency', '비타민 결핍', 'Vitamin Deficiency'),
    ('mineral_imbalance', '미네랄 불균형', 'Mineral Imbalance')
)
UPDATE i18n_translations
SET
  ko = (SELECT d.ko FROM dt d WHERE ('master.disease_type.' || d.code) = i18n_translations.key),
  en = (SELECT d.en FROM dt d WHERE ('master.disease_type.' || d.code) = i18n_translations.key),
  updated_at = datetime('now')
WHERE key IN (SELECT 'master.disease_type.' || code FROM dt);

-- F. ko/en 값이 비었거나 key 문자열이면 fallback 라벨로 교체
UPDATE i18n_translations
SET
  ko = CASE
    WHEN TRIM(COALESCE(ko, '')) = '' OR ko LIKE 'master.%'
      THEN COALESCE(
        (SELECT REPLACE(mc.code, '_', ' ')
         FROM master_categories mc
         WHERE ('master.' || mc.code) = i18n_translations.key),
        (SELECT REPLACE(mi.code, '_', ' ')
         FROM master_items mi
         JOIN master_categories mc ON mc.id = mi.category_id
         WHERE ('master.' || mc.code || '.' || mi.code) = i18n_translations.key),
        ko
      )
    ELSE ko
  END,
  en = CASE
    WHEN TRIM(COALESCE(en, '')) = '' OR en LIKE 'master.%'
      THEN COALESCE(
        (SELECT REPLACE(mc.code, '_', ' ')
         FROM master_categories mc
         WHERE ('master.' || mc.code) = i18n_translations.key),
        (SELECT REPLACE(mi.code, '_', ' ')
         FROM master_items mi
         JOIN master_categories mc ON mc.id = mi.category_id
         WHERE ('master.' || mc.code || '.' || mi.code) = i18n_translations.key),
        en
      )
    ELSE en
  END,
  updated_at = datetime('now')
WHERE key LIKE 'master.%';

