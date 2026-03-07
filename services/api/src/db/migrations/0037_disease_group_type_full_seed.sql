-- 0037: Disease Group (L1) + Disease History Type (L2) full seed
-- Category chain: disease_group -> disease_type

UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('disease_group', 'disease_type');

-- L1 disease groups
WITH groups(id, code, sort_order, ko, en) AS (
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
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  g.id,
  c.id,
  NULL,
  g.code,
  g.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM groups g
JOIN master_categories c ON c.code = 'disease_group';

-- L2 disease types (history)
WITH diseases(id, group_code, code, sort_order, ko, en) AS (
  VALUES
    -- 1. endocrine_disease
    ('mi-dt-diabetes-mellitus', 'endocrine_disease', 'diabetes_mellitus', 101, '당뇨병', 'Diabetes Mellitus'),
    ('mi-dt-hypothyroidism', 'endocrine_disease', 'hypothyroidism', 102, '갑상선 기능저하증', 'Hypothyroidism'),
    ('mi-dt-hyperthyroidism', 'endocrine_disease', 'hyperthyroidism', 103, '갑상선 기능항진증', 'Hyperthyroidism'),
    ('mi-dt-cushing-syndrome', 'endocrine_disease', 'cushing_syndrome', 104, '쿠싱증후군', 'Cushing Syndrome'),
    ('mi-dt-addison-disease', 'endocrine_disease', 'addison_disease', 105, '애디슨병', 'Addison Disease'),
    ('mi-dt-insulin-resistance', 'endocrine_disease', 'insulin_resistance', 106, '인슐린 저항성', 'Insulin Resistance'),
    ('mi-dt-pituitary-tumor', 'endocrine_disease', 'pituitary_tumor', 107, '뇌하수체 종양', 'Pituitary Tumor'),
    ('mi-dt-thyroid-tumor', 'endocrine_disease', 'thyroid_tumor', 108, '갑상선 종양', 'Thyroid Tumor'),
    ('mi-dt-adrenal-tumor', 'endocrine_disease', 'adrenal_tumor', 109, '부신 종양', 'Adrenal Tumor'),

    -- 2. cardiovascular_disease
    ('mi-dt-heart-failure', 'cardiovascular_disease', 'heart_failure', 201, '심부전', 'Heart Failure'),
    ('mi-dt-heart-murmur', 'cardiovascular_disease', 'heart_murmur', 202, '심잡음', 'Heart Murmur'),
    ('mi-dt-dilated-cardiomyopathy', 'cardiovascular_disease', 'dilated_cardiomyopathy', 203, '확장성 심근증', 'Dilated Cardiomyopathy'),
    ('mi-dt-hypertrophic-cardiomyopathy', 'cardiovascular_disease', 'hypertrophic_cardiomyopathy', 204, '비대성 심근증', 'Hypertrophic Cardiomyopathy'),
    ('mi-dt-arrhythmia', 'cardiovascular_disease', 'arrhythmia', 205, '부정맥', 'Arrhythmia'),
    ('mi-dt-hypertension', 'cardiovascular_disease', 'hypertension', 206, '고혈압', 'Hypertension'),
    ('mi-dt-pulmonary-hypertension', 'cardiovascular_disease', 'pulmonary_hypertension', 207, '폐고혈압', 'Pulmonary Hypertension'),

    -- 3. respiratory_disease
    ('mi-dt-asthma', 'respiratory_disease', 'asthma', 301, '천식', 'Asthma'),
    ('mi-dt-pneumonia', 'respiratory_disease', 'pneumonia', 302, '폐렴', 'Pneumonia'),
    ('mi-dt-bronchitis', 'respiratory_disease', 'bronchitis', 303, '기관지염', 'Bronchitis'),
    ('mi-dt-tracheal-collapse', 'respiratory_disease', 'tracheal_collapse', 304, '기관허탈', 'Tracheal Collapse'),
    ('mi-dt-respiratory-infection', 'respiratory_disease', 'respiratory_infection', 305, '호흡기 감염', 'Respiratory Infection'),
    ('mi-dt-rhinitis', 'respiratory_disease', 'rhinitis', 306, '비염', 'Rhinitis'),

    -- 4. digestive_disease
    ('mi-dt-gastritis', 'digestive_disease', 'gastritis', 401, '위염', 'Gastritis'),
    ('mi-dt-enteritis', 'digestive_disease', 'enteritis', 402, '장염', 'Enteritis'),
    ('mi-dt-pancreatitis', 'digestive_disease', 'pancreatitis', 403, '췌장염', 'Pancreatitis'),
    ('mi-dt-inflammatory-bowel-disease', 'digestive_disease', 'inflammatory_bowel_disease', 404, '염증성 장질환', 'Inflammatory Bowel Disease'),
    ('mi-dt-gastroenteritis', 'digestive_disease', 'gastroenteritis', 405, '위장염', 'Gastroenteritis'),
    ('mi-dt-constipation', 'digestive_disease', 'constipation', 406, '변비', 'Constipation'),
    ('mi-dt-colitis', 'digestive_disease', 'colitis', 407, '대장염', 'Colitis'),

    -- 5. urinary_disease
    ('mi-dt-cystitis', 'urinary_disease', 'cystitis', 501, '방광염', 'Cystitis'),
    ('mi-dt-urinary-stone', 'urinary_disease', 'urinary_stone', 502, '요로결석', 'Urinary Stone'),
    ('mi-dt-urinary-infection', 'urinary_disease', 'urinary_infection', 503, '요로 감염', 'Urinary Infection'),
    ('mi-dt-incontinence', 'urinary_disease', 'incontinence', 504, '요실금', 'Incontinence'),

    -- 6. kidney_disease
    ('mi-dt-kidney-failure', 'kidney_disease', 'kidney_failure', 601, '신부전', 'Kidney Failure'),
    ('mi-dt-chronic-kidney-disease', 'kidney_disease', 'chronic_kidney_disease', 602, '만성 신장질환', 'Chronic Kidney Disease'),
    ('mi-dt-acute-kidney-injury', 'kidney_disease', 'acute_kidney_injury', 603, '급성 신손상', 'Acute Kidney Injury'),
    ('mi-dt-pyelonephritis', 'kidney_disease', 'pyelonephritis', 604, '신우신염', 'Pyelonephritis'),
    ('mi-dt-proteinuria', 'kidney_disease', 'proteinuria', 605, '단백뇨', 'Proteinuria'),

    -- 7. liver_disease
    ('mi-dt-hepatitis', 'liver_disease', 'hepatitis', 701, '간염', 'Hepatitis'),
    ('mi-dt-liver-failure', 'liver_disease', 'liver_failure', 702, '간부전', 'Liver Failure'),
    ('mi-dt-fatty-liver', 'liver_disease', 'fatty_liver', 703, '지방간', 'Fatty Liver'),
    ('mi-dt-cholangitis', 'liver_disease', 'cholangitis', 704, '담관염', 'Cholangitis'),
    ('mi-dt-gallbladder-mucocele', 'liver_disease', 'gallbladder_mucocele', 705, '담낭점액종', 'Gallbladder Mucocele'),

    -- 8. skin_disease
    ('mi-dt-dermatitis', 'skin_disease', 'dermatitis', 801, '피부염', 'Dermatitis'),
    ('mi-dt-atopic-dermatitis', 'skin_disease', 'atopic_dermatitis', 802, '아토피 피부염', 'Atopic Dermatitis'),
    ('mi-dt-fungal-infection', 'skin_disease', 'fungal_infection', 803, '곰팡이 감염', 'Fungal Infection'),
    ('mi-dt-bacterial-skin-infection', 'skin_disease', 'bacterial_skin_infection', 804, '세균성 피부 감염', 'Bacterial Skin Infection'),
    ('mi-dt-allergic-skin-disease', 'skin_disease', 'allergic_skin_disease', 805, '알러지성 피부질환', 'Allergic Skin Disease'),
    ('mi-dt-pyoderma', 'skin_disease', 'pyoderma', 806, '농피증', 'Pyoderma'),

    -- 9. eye_disease
    ('mi-dt-cataract', 'eye_disease', 'cataract', 901, '백내장', 'Cataract'),
    ('mi-dt-glaucoma', 'eye_disease', 'glaucoma', 902, '녹내장', 'Glaucoma'),
    ('mi-dt-conjunctivitis', 'eye_disease', 'conjunctivitis', 903, '결막염', 'Conjunctivitis'),
    ('mi-dt-dry-eye', 'eye_disease', 'dry_eye', 904, '안구건조증', 'Dry Eye'),
    ('mi-dt-corneal-ulcer', 'eye_disease', 'corneal_ulcer', 905, '각막궤양', 'Corneal Ulcer'),

    -- 10. ear_disease
    ('mi-dt-otitis-externa', 'ear_disease', 'otitis_externa', 1001, '외이염', 'Otitis Externa'),
    ('mi-dt-otitis-media', 'ear_disease', 'otitis_media', 1002, '중이염', 'Otitis Media'),
    ('mi-dt-ear-mite-infestation', 'ear_disease', 'ear_mite_infestation', 1003, '귀진드기 감염', 'Ear Mite Infestation'),

    -- 11. dental_disease
    ('mi-dt-periodontal-disease', 'dental_disease', 'periodontal_disease', 1101, '치주질환', 'Periodontal Disease'),
    ('mi-dt-gingivitis', 'dental_disease', 'gingivitis', 1102, '치은염', 'Gingivitis'),
    ('mi-dt-tooth-fracture', 'dental_disease', 'tooth_fracture', 1103, '치아 파절', 'Tooth Fracture'),
    ('mi-dt-stomatitis', 'dental_disease', 'stomatitis', 1104, '구내염', 'Stomatitis'),

    -- 12. neurological_disease
    ('mi-dt-seizure-disorder', 'neurological_disease', 'seizure_disorder', 1201, '발작질환', 'Seizure Disorder'),
    ('mi-dt-epilepsy', 'neurological_disease', 'epilepsy', 1202, '간질', 'Epilepsy'),
    ('mi-dt-vestibular-disease', 'neurological_disease', 'vestibular_disease', 1203, '전정질환', 'Vestibular Disease'),
    ('mi-dt-meningitis', 'neurological_disease', 'meningitis', 1204, '수막염', 'Meningitis'),

    -- 13. musculoskeletal_disease
    ('mi-dt-arthritis', 'musculoskeletal_disease', 'arthritis', 1301, '관절염', 'Arthritis'),
    ('mi-dt-patellar-luxation', 'musculoskeletal_disease', 'patellar_luxation', 1302, '슬개골 탈구', 'Patellar Luxation'),
    ('mi-dt-hip-dysplasia', 'musculoskeletal_disease', 'hip_dysplasia', 1303, '고관절 이형성증', 'Hip Dysplasia'),
    ('mi-dt-ivdd', 'musculoskeletal_disease', 'ivdd', 1304, '디스크 질환', 'Intervertebral Disc Disease'),

    -- 14. immune_disease
    ('mi-dt-immune-mediated-anemia', 'immune_disease', 'immune_mediated_anemia', 1401, '면역매개성 빈혈', 'Immune-Mediated Anemia'),
    ('mi-dt-immune-mediated-thrombocytopenia', 'immune_disease', 'immune_mediated_thrombocytopenia', 1402, '면역매개성 혈소판감소증', 'Immune-Mediated Thrombocytopenia'),
    ('mi-dt-lupus', 'immune_disease', 'lupus', 1403, '루푸스', 'Lupus'),

    -- 15. infectious_disease
    ('mi-dt-parvovirus', 'infectious_disease', 'parvovirus', 1501, '파보바이러스', 'Parvovirus'),
    ('mi-dt-distemper', 'infectious_disease', 'distemper', 1502, '디스템퍼', 'Distemper'),
    ('mi-dt-kennel-cough', 'infectious_disease', 'kennel_cough', 1503, '켄넬코프', 'Kennel Cough'),
    ('mi-dt-leptospirosis', 'infectious_disease', 'leptospirosis', 1504, '렙토스피라증', 'Leptospirosis'),
    ('mi-dt-heartworm', 'infectious_disease', 'heartworm', 1505, '심장사상충', 'Heartworm'),

    -- 16. parasitic_disease
    ('mi-dt-flea-infestation', 'parasitic_disease', 'flea_infestation', 1601, '벼룩 감염', 'Flea Infestation'),
    ('mi-dt-tick-infestation', 'parasitic_disease', 'tick_infestation', 1602, '진드기 감염', 'Tick Infestation'),
    ('mi-dt-mange', 'parasitic_disease', 'mange', 1603, '옴', 'Mange'),
    ('mi-dt-intestinal-parasites', 'parasitic_disease', 'intestinal_parasites', 1604, '장내 기생충', 'Intestinal Parasites'),

    -- 17. metabolic_disease
    ('mi-dt-obesity', 'metabolic_disease', 'obesity', 1701, '비만', 'Obesity'),
    ('mi-dt-hyperlipidemia', 'metabolic_disease', 'hyperlipidemia', 1702, '고지혈증', 'Hyperlipidemia'),
    ('mi-dt-ketoacidosis', 'metabolic_disease', 'ketoacidosis', 1703, '케톤산증', 'Ketoacidosis'),

    -- 18. reproductive_disease
    ('mi-dt-pyometra', 'reproductive_disease', 'pyometra', 1801, '자궁축농증', 'Pyometra'),
    ('mi-dt-mastitis', 'reproductive_disease', 'mastitis', 1802, '유선염', 'Mastitis'),
    ('mi-dt-prostatitis', 'reproductive_disease', 'prostatitis', 1803, '전립선염', 'Prostatitis'),

    -- 19. genetic_disease
    ('mi-dt-congenital-heart-defect', 'genetic_disease', 'congenital_heart_defect', 1901, '선천성 심장질환', 'Congenital Heart Defect'),
    ('mi-dt-inherited-blindness', 'genetic_disease', 'inherited_blindness', 1902, '유전성 실명', 'Inherited Blindness'),
    ('mi-dt-congenital-deafness', 'genetic_disease', 'congenital_deafness', 1903, '선천성 청각장애', 'Congenital Deafness'),

    -- 20. cancer_disease
    ('mi-dt-lymphoma', 'cancer_disease', 'lymphoma', 2001, '림프종', 'Lymphoma'),
    ('mi-dt-mast-cell-tumor', 'cancer_disease', 'mast_cell_tumor', 2002, '비만세포종', 'Mast Cell Tumor'),
    ('mi-dt-melanoma', 'cancer_disease', 'melanoma', 2003, '흑색종', 'Melanoma'),
    ('mi-dt-osteosarcoma', 'cancer_disease', 'osteosarcoma', 2004, '골육종', 'Osteosarcoma'),

    -- 21. behavioral_disease
    ('mi-dt-separation-anxiety', 'behavioral_disease', 'separation_anxiety', 2101, '분리불안', 'Separation Anxiety'),
    ('mi-dt-compulsive-disorder', 'behavioral_disease', 'compulsive_disorder', 2102, '강박행동장애', 'Compulsive Disorder'),
    ('mi-dt-aggression-disorder', 'behavioral_disease', 'aggression_disorder', 2103, '공격성 문제', 'Aggression Disorder'),

    -- 22. nutritional_disease
    ('mi-dt-malnutrition', 'nutritional_disease', 'malnutrition', 2201, '영양실조', 'Malnutrition'),
    ('mi-dt-vitamin-deficiency', 'nutritional_disease', 'vitamin_deficiency', 2202, '비타민 결핍', 'Vitamin Deficiency'),
    ('mi-dt-mineral-imbalance', 'nutritional_disease', 'mineral_imbalance', 2203, '미네랄 불균형', 'Mineral Imbalance')
)
INSERT OR IGNORE INTO master_items (
  id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at
)
SELECT
  d.id,
  c2.id,
  g.id,
  d.code,
  d.sort_order,
  'active',
  '{}',
  datetime('now'),
  datetime('now')
FROM diseases d
JOIN master_categories c2 ON c2.code = 'disease_type'
JOIN master_items g
  ON g.code = d.group_code
 AND g.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1);

-- i18n upsert-style (insert + update)
WITH trans(key, ko, en) AS (
  SELECT 'master.disease_group.' || code, ko, en FROM (
    VALUES
      ('endocrine_disease','내분비질환','Endocrine Disease'),
      ('cardiovascular_disease','심혈관 질환','Cardiovascular Disease'),
      ('respiratory_disease','호흡기 질환','Respiratory Disease'),
      ('digestive_disease','소화기 질환','Digestive Disease'),
      ('urinary_disease','비뇨기 질환','Urinary Disease'),
      ('kidney_disease','신장 질환','Kidney Disease'),
      ('liver_disease','간 질환','Liver Disease'),
      ('skin_disease','피부 질환','Skin Disease'),
      ('eye_disease','안과 질환','Eye Disease'),
      ('ear_disease','귀 질환','Ear Disease'),
      ('dental_disease','치과 질환','Dental Disease'),
      ('neurological_disease','신경계 질환','Neurological Disease'),
      ('musculoskeletal_disease','근골격계 질환','Musculoskeletal Disease'),
      ('immune_disease','면역 질환','Immune Disease'),
      ('infectious_disease','감염성 질환','Infectious Disease'),
      ('parasitic_disease','기생충 질환','Parasitic Disease'),
      ('metabolic_disease','대사 질환','Metabolic Disease'),
      ('reproductive_disease','생식기 질환','Reproductive Disease'),
      ('genetic_disease','유전 질환','Genetic Disease'),
      ('cancer_disease','종양 질환','Cancer'),
      ('behavioral_disease','행동 질환','Behavioral Disorder'),
      ('nutritional_disease','영양 질환','Nutritional Disorder')
  )
  UNION ALL
  SELECT 'master.disease_type.' || code, ko, en FROM (
    VALUES
      ('diabetes_mellitus','당뇨병','Diabetes Mellitus'),('hypothyroidism','갑상선 기능저하증','Hypothyroidism'),('hyperthyroidism','갑상선 기능항진증','Hyperthyroidism'),('cushing_syndrome','쿠싱증후군','Cushing Syndrome'),('addison_disease','애디슨병','Addison Disease'),('insulin_resistance','인슐린 저항성','Insulin Resistance'),('pituitary_tumor','뇌하수체 종양','Pituitary Tumor'),('thyroid_tumor','갑상선 종양','Thyroid Tumor'),('adrenal_tumor','부신 종양','Adrenal Tumor'),
      ('heart_failure','심부전','Heart Failure'),('heart_murmur','심잡음','Heart Murmur'),('dilated_cardiomyopathy','확장성 심근증','Dilated Cardiomyopathy'),('hypertrophic_cardiomyopathy','비대성 심근증','Hypertrophic Cardiomyopathy'),('arrhythmia','부정맥','Arrhythmia'),('hypertension','고혈압','Hypertension'),('pulmonary_hypertension','폐고혈압','Pulmonary Hypertension'),
      ('asthma','천식','Asthma'),('pneumonia','폐렴','Pneumonia'),('bronchitis','기관지염','Bronchitis'),('tracheal_collapse','기관허탈','Tracheal Collapse'),('respiratory_infection','호흡기 감염','Respiratory Infection'),('rhinitis','비염','Rhinitis'),
      ('gastritis','위염','Gastritis'),('enteritis','장염','Enteritis'),('pancreatitis','췌장염','Pancreatitis'),('inflammatory_bowel_disease','염증성 장질환','Inflammatory Bowel Disease'),('gastroenteritis','위장염','Gastroenteritis'),('constipation','변비','Constipation'),('colitis','대장염','Colitis'),
      ('cystitis','방광염','Cystitis'),('urinary_stone','요로결석','Urinary Stone'),('urinary_infection','요로 감염','Urinary Infection'),('incontinence','요실금','Incontinence'),
      ('kidney_failure','신부전','Kidney Failure'),('chronic_kidney_disease','만성 신장질환','Chronic Kidney Disease'),('acute_kidney_injury','급성 신손상','Acute Kidney Injury'),('pyelonephritis','신우신염','Pyelonephritis'),('proteinuria','단백뇨','Proteinuria'),
      ('hepatitis','간염','Hepatitis'),('liver_failure','간부전','Liver Failure'),('fatty_liver','지방간','Fatty Liver'),('cholangitis','담관염','Cholangitis'),('gallbladder_mucocele','담낭점액종','Gallbladder Mucocele'),
      ('dermatitis','피부염','Dermatitis'),('atopic_dermatitis','아토피 피부염','Atopic Dermatitis'),('fungal_infection','곰팡이 감염','Fungal Infection'),('bacterial_skin_infection','세균성 피부 감염','Bacterial Skin Infection'),('allergic_skin_disease','알러지성 피부질환','Allergic Skin Disease'),('pyoderma','농피증','Pyoderma'),
      ('cataract','백내장','Cataract'),('glaucoma','녹내장','Glaucoma'),('conjunctivitis','결막염','Conjunctivitis'),('dry_eye','안구건조증','Dry Eye'),('corneal_ulcer','각막궤양','Corneal Ulcer'),
      ('otitis_externa','외이염','Otitis Externa'),('otitis_media','중이염','Otitis Media'),('ear_mite_infestation','귀진드기 감염','Ear Mite Infestation'),
      ('periodontal_disease','치주질환','Periodontal Disease'),('gingivitis','치은염','Gingivitis'),('tooth_fracture','치아 파절','Tooth Fracture'),('stomatitis','구내염','Stomatitis'),
      ('seizure_disorder','발작질환','Seizure Disorder'),('epilepsy','간질','Epilepsy'),('vestibular_disease','전정질환','Vestibular Disease'),('meningitis','수막염','Meningitis'),
      ('arthritis','관절염','Arthritis'),('patellar_luxation','슬개골 탈구','Patellar Luxation'),('hip_dysplasia','고관절 이형성증','Hip Dysplasia'),('ivdd','디스크 질환','Intervertebral Disc Disease'),
      ('immune_mediated_anemia','면역매개성 빈혈','Immune-Mediated Anemia'),('immune_mediated_thrombocytopenia','면역매개성 혈소판감소증','Immune-Mediated Thrombocytopenia'),('lupus','루푸스','Lupus'),
      ('parvovirus','파보바이러스','Parvovirus'),('distemper','디스템퍼','Distemper'),('kennel_cough','켄넬코프','Kennel Cough'),('leptospirosis','렙토스피라증','Leptospirosis'),('heartworm','심장사상충','Heartworm'),
      ('flea_infestation','벼룩 감염','Flea Infestation'),('tick_infestation','진드기 감염','Tick Infestation'),('mange','옴','Mange'),('intestinal_parasites','장내 기생충','Intestinal Parasites'),
      ('obesity','비만','Obesity'),('hyperlipidemia','고지혈증','Hyperlipidemia'),('ketoacidosis','케톤산증','Ketoacidosis'),
      ('pyometra','자궁축농증','Pyometra'),('mastitis','유선염','Mastitis'),('prostatitis','전립선염','Prostatitis'),
      ('congenital_heart_defect','선천성 심장질환','Congenital Heart Defect'),('inherited_blindness','유전성 실명','Inherited Blindness'),('congenital_deafness','선천성 청각장애','Congenital Deafness'),
      ('lymphoma','림프종','Lymphoma'),('mast_cell_tumor','비만세포종','Mast Cell Tumor'),('melanoma','흑색종','Melanoma'),('osteosarcoma','골육종','Osteosarcoma'),
      ('separation_anxiety','분리불안','Separation Anxiety'),('compulsive_disorder','강박행동장애','Compulsive Disorder'),('aggression_disorder','공격성 문제','Aggression Disorder'),
      ('malnutrition','영양실조','Malnutrition'),('vitamin_deficiency','비타민 결핍','Vitamin Deficiency'),('mineral_imbalance','미네랄 불균형','Mineral Imbalance')
  )
)
INSERT OR IGNORE INTO i18n_translations
  (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
SELECT
  lower(hex(randomblob(16))),
  key,
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
FROM trans;

WITH trans(key, ko, en) AS (
  SELECT 'master.disease_group.' || code, ko, en FROM (
    VALUES
      ('endocrine_disease','내분비질환','Endocrine Disease'),('cardiovascular_disease','심혈관 질환','Cardiovascular Disease'),('respiratory_disease','호흡기 질환','Respiratory Disease'),('digestive_disease','소화기 질환','Digestive Disease'),('urinary_disease','비뇨기 질환','Urinary Disease'),('kidney_disease','신장 질환','Kidney Disease'),('liver_disease','간 질환','Liver Disease'),('skin_disease','피부 질환','Skin Disease'),('eye_disease','안과 질환','Eye Disease'),('ear_disease','귀 질환','Ear Disease'),('dental_disease','치과 질환','Dental Disease'),('neurological_disease','신경계 질환','Neurological Disease'),('musculoskeletal_disease','근골격계 질환','Musculoskeletal Disease'),('immune_disease','면역 질환','Immune Disease'),('infectious_disease','감염성 질환','Infectious Disease'),('parasitic_disease','기생충 질환','Parasitic Disease'),('metabolic_disease','대사 질환','Metabolic Disease'),('reproductive_disease','생식기 질환','Reproductive Disease'),('genetic_disease','유전 질환','Genetic Disease'),('cancer_disease','종양 질환','Cancer'),('behavioral_disease','행동 질환','Behavioral Disorder'),('nutritional_disease','영양 질환','Nutritional Disorder')
  )
)
UPDATE i18n_translations
SET
  ko = (SELECT t.ko FROM trans t WHERE t.key = i18n_translations.key),
  en = (SELECT t.en FROM trans t WHERE t.key = i18n_translations.key),
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM trans);
