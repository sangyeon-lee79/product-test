-- Migration 0010: My Pet 구조화 프로필 (마스터데이터 선택형)

-- 1) pets 테이블 확장 (master item id 저장 중심)
ALTER TABLE pets ADD COLUMN pet_type_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN gender_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN neuter_status_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN life_stage_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN body_size_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN country_id TEXT REFERENCES countries(id);
ALTER TABLE pets ADD COLUMN medication_status_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN weight_unit_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN health_condition_level_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN activity_level_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN diet_type_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN living_style_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN ownership_type_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN coat_length_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN coat_type_id TEXT REFERENCES master_items(id);
ALTER TABLE pets ADD COLUMN grooming_cycle_id TEXT REFERENCES master_items(id);

ALTER TABLE pets ADD COLUMN color_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pets ADD COLUMN allergy_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pets ADD COLUMN disease_history_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pets ADD COLUMN symptom_tag_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pets ADD COLUMN vaccination_ids TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pets ADD COLUMN temperament_ids TEXT NOT NULL DEFAULT '[]';

ALTER TABLE pets ADD COLUMN notes TEXT;
ALTER TABLE pets ADD COLUMN intro_text TEXT;

-- 마이크로칩: 시스템 전체 unique (삭제 상태 제외)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_microchip_unique
  ON pets(microchip_no)
  WHERE microchip_no IS NOT NULL AND TRIM(microchip_no) <> '' AND status != 'deleted';

-- 2) 마스터 카테고리 seed
INSERT OR IGNORE INTO master_categories (id, key, sort_order, is_active, created_at, updated_at) VALUES
  ('mc-pet-type', 'pet_type', 101, 1, datetime('now'), datetime('now')),
  ('mc-pet-breed', 'pet_breed', 102, 1, datetime('now'), datetime('now')),
  ('mc-pet-gender', 'pet_gender', 103, 1, datetime('now'), datetime('now')),
  ('mc-neuter-status', 'neuter_status', 104, 1, datetime('now'), datetime('now')),
  ('mc-life-stage', 'life_stage', 105, 1, datetime('now'), datetime('now')),
  ('mc-body-size', 'body_size', 106, 1, datetime('now'), datetime('now')),
  ('mc-pet-color', 'pet_color', 107, 1, datetime('now'), datetime('now')),
  ('mc-allergy-type', 'allergy_type', 108, 1, datetime('now'), datetime('now')),
  ('mc-disease-type', 'disease_type', 109, 1, datetime('now'), datetime('now')),
  ('mc-symptom-type', 'symptom_type', 110, 1, datetime('now'), datetime('now')),
  ('mc-vaccination-type', 'vaccination_type', 111, 1, datetime('now'), datetime('now')),
  ('mc-medication-status', 'medication_status', 112, 1, datetime('now'), datetime('now')),
  ('mc-weight-unit', 'weight_unit', 113, 1, datetime('now'), datetime('now')),
  ('mc-health-level', 'health_condition_level', 114, 1, datetime('now'), datetime('now')),
  ('mc-activity-level', 'activity_level', 115, 1, datetime('now'), datetime('now')),
  ('mc-diet-type', 'diet_type', 116, 1, datetime('now'), datetime('now')),
  ('mc-temperament-type', 'temperament_type', 117, 1, datetime('now'), datetime('now')),
  ('mc-living-style', 'living_style', 118, 1, datetime('now'), datetime('now')),
  ('mc-ownership-type', 'ownership_type', 119, 1, datetime('now'), datetime('now')),
  ('mc-coat-length', 'coat_length', 120, 1, datetime('now'), datetime('now')),
  ('mc-coat-type', 'coat_type', 121, 1, datetime('now'), datetime('now')),
  ('mc-grooming-cycle', 'grooming_cycle', 122, 1, datetime('now'), datetime('now'));

-- 3) 마스터 아이템 seed (Dog/Cat 중심)
INSERT OR IGNORE INTO master_items (id, category_id, key, parent_id, sort_order, is_active, metadata, created_at, updated_at) VALUES
  -- pet_type
  ('mi-ptype-dog', 'mc-pet-type', 'dog', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ptype-cat', 'mc-pet-type', 'cat', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ptype-bird', 'mc-pet-type', 'bird', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ptype-rabbit', 'mc-pet-type', 'rabbit', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ptype-reptile', 'mc-pet-type', 'reptile', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ptype-other', 'mc-pet-type', 'other', NULL, 6, 1, '{}', datetime('now'), datetime('now')),

  -- pet_breed
  ('mi-breed-pomeranian', 'mc-pet-breed', 'pomeranian', NULL, 1, 1, '{"pet_type_keys":["dog"]}', datetime('now'), datetime('now')),
  ('mi-breed-poodle', 'mc-pet-breed', 'poodle', NULL, 2, 1, '{"pet_type_keys":["dog"]}', datetime('now'), datetime('now')),
  ('mi-breed-golden', 'mc-pet-breed', 'golden_retriever', NULL, 3, 1, '{"pet_type_keys":["dog"]}', datetime('now'), datetime('now')),
  ('mi-breed-ksh', 'mc-pet-breed', 'korean_shorthair', NULL, 4, 1, '{"pet_type_keys":["cat"]}', datetime('now'), datetime('now')),
  ('mi-breed-rblue', 'mc-pet-breed', 'russian_blue', NULL, 5, 1, '{"pet_type_keys":["cat"]}', datetime('now'), datetime('now')),
  ('mi-breed-persian', 'mc-pet-breed', 'persian', NULL, 6, 1, '{"pet_type_keys":["cat"]}', datetime('now'), datetime('now')),

  -- gender
  ('mi-gender-male', 'mc-pet-gender', 'male', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-gender-female', 'mc-pet-gender', 'female', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-gender-unknown', 'mc-pet-gender', 'unknown', NULL, 3, 1, '{}', datetime('now'), datetime('now')),

  -- neuter_status
  ('mi-neuter-yes', 'mc-neuter-status', 'yes', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-neuter-no', 'mc-neuter-status', 'no', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-neuter-unknown', 'mc-neuter-status', 'unknown', NULL, 3, 1, '{}', datetime('now'), datetime('now')),

  -- life_stage
  ('mi-life-baby', 'mc-life-stage', 'baby', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-life-junior', 'mc-life-stage', 'junior', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-life-adult', 'mc-life-stage', 'adult', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-life-senior', 'mc-life-stage', 'senior', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- body_size
  ('mi-size-tiny', 'mc-body-size', 'tiny', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-size-small', 'mc-body-size', 'small', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-size-medium', 'mc-body-size', 'medium', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-size-large', 'mc-body-size', 'large', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-size-giant', 'mc-body-size', 'giant', NULL, 5, 1, '{}', datetime('now'), datetime('now')),

  -- pet_color
  ('mi-color-white', 'mc-pet-color', 'white', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-black', 'mc-pet-color', 'black', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-brown', 'mc-pet-color', 'brown', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-gray', 'mc-pet-color', 'gray', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-cream', 'mc-pet-color', 'cream', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-orange', 'mc-pet-color', 'orange', NULL, 6, 1, '{}', datetime('now'), datetime('now')),
  ('mi-color-mixed', 'mc-pet-color', 'mixed', NULL, 7, 1, '{}', datetime('now'), datetime('now')),

  -- allergy_type
  ('mi-allergy-chicken', 'mc-allergy-type', 'chicken', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-beef', 'mc-allergy-type', 'beef', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-grain', 'mc-allergy-type', 'grain', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-dust', 'mc-allergy-type', 'dust', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-pollen', 'mc-allergy-type', 'pollen', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-dairy', 'mc-allergy-type', 'dairy', NULL, 6, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-seafood', 'mc-allergy-type', 'seafood', NULL, 7, 1, '{}', datetime('now'), datetime('now')),
  ('mi-allergy-none', 'mc-allergy-type', 'none', NULL, 8, 1, '{}', datetime('now'), datetime('now')),

  -- disease_type
  ('mi-dtype-diabetes', 'mc-disease-type', 'diabetes', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-dtype-arthritis', 'mc-disease-type', 'arthritis', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-dtype-heart', 'mc-disease-type', 'heart_disease', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-dtype-kidney', 'mc-disease-type', 'kidney_disease', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-dtype-skin', 'mc-disease-type', 'skin_disease', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-dtype-none', 'mc-disease-type', 'none', NULL, 6, 1, '{}', datetime('now'), datetime('now')),

  -- symptom_type
  ('mi-stype-vomiting', 'mc-symptom-type', 'vomiting', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-stype-diarrhea', 'mc-symptom-type', 'diarrhea', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-stype-cough', 'mc-symptom-type', 'cough', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-stype-itching', 'mc-symptom-type', 'itching', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-stype-weightloss', 'mc-symptom-type', 'weight_loss', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-stype-appetite-loss', 'mc-symptom-type', 'loss_of_appetite', NULL, 6, 1, '{}', datetime('now'), datetime('now')),

  -- vaccination_type
  ('mi-vac-rabies', 'mc-vaccination-type', 'rabies', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-vac-dhpp', 'mc-vaccination-type', 'dhpp', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-vac-bordetella', 'mc-vaccination-type', 'bordetella', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-vac-fvrcp', 'mc-vaccination-type', 'fvrcp', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- medication_status
  ('mi-med-none', 'mc-medication-status', 'none', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-med-ongoing', 'mc-medication-status', 'ongoing', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-med-temporary', 'mc-medication-status', 'temporary', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-med-as-needed', 'mc-medication-status', 'as_needed', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- weight_unit
  ('mi-unit-kg', 'mc-weight-unit', 'kg', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-unit-lb', 'mc-weight-unit', 'lb', NULL, 2, 1, '{}', datetime('now'), datetime('now')),

  -- health_condition_level
  ('mi-hcl-healthy', 'mc-health-level', 'healthy', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-hcl-monitoring', 'mc-health-level', 'monitoring', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-hcl-needs-care', 'mc-health-level', 'needs_care', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-hcl-chronic', 'mc-health-level', 'chronic_condition', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- activity_level
  ('mi-act-low', 'mc-activity-level', 'low', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-act-normal', 'mc-activity-level', 'normal', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-act-high', 'mc-activity-level', 'high', NULL, 3, 1, '{}', datetime('now'), datetime('now')),

  -- diet_type
  ('mi-diet-dry', 'mc-diet-type', 'dry_food', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-diet-wet', 'mc-diet-type', 'wet_food', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-diet-raw', 'mc-diet-type', 'raw_food', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-diet-prescription', 'mc-diet-type', 'prescription_diet', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-diet-mixed', 'mc-diet-type', 'mixed', NULL, 5, 1, '{}', datetime('now'), datetime('now')),

  -- temperament_type
  ('mi-temp-friendly', 'mc-temperament-type', 'friendly', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-sensitive', 'mc-temperament-type', 'sensitive', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-aggressive', 'mc-temperament-type', 'aggressive', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-calm', 'mc-temperament-type', 'calm', NULL, 4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-active', 'mc-temperament-type', 'active', NULL, 5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-social', 'mc-temperament-type', 'social', NULL, 6, 1, '{}', datetime('now'), datetime('now')),
  ('mi-temp-shy', 'mc-temperament-type', 'shy', NULL, 7, 1, '{}', datetime('now'), datetime('now')),

  -- living_style
  ('mi-live-indoor', 'mc-living-style', 'indoor', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-live-outdoor', 'mc-living-style', 'outdoor', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-live-mixed', 'mc-living-style', 'mixed', NULL, 3, 1, '{}', datetime('now'), datetime('now')),

  -- ownership_type
  ('mi-own-owned', 'mc-ownership-type', 'owned', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-own-fostered', 'mc-ownership-type', 'fostered', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-own-rescued', 'mc-ownership-type', 'rescued', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-own-temporary', 'mc-ownership-type', 'temporary_care', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- coat_length
  ('mi-clen-hairless', 'mc-coat-length', 'hairless', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-clen-short', 'mc-coat-length', 'short', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-clen-medium', 'mc-coat-length', 'medium', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-clen-long', 'mc-coat-length', 'long', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- coat_type
  ('mi-ctype-straight', 'mc-coat-type', 'straight', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ctype-curly', 'mc-coat-type', 'curly', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ctype-double', 'mc-coat-type', 'double_coat', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-ctype-wiry', 'mc-coat-type', 'wiry', NULL, 4, 1, '{}', datetime('now'), datetime('now')),

  -- grooming_cycle
  ('mi-groom-weekly', 'mc-grooming-cycle', 'weekly', NULL, 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-groom-biweekly', 'mc-grooming-cycle', 'biweekly', NULL, 2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-groom-monthly', 'mc-grooming-cycle', 'monthly', NULL, 3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-groom-needed', 'mc-grooming-cycle', 'as_needed', NULL, 4, 1, '{}', datetime('now'), datetime('now'));

-- 4) i18n seed (카테고리 + 아이템, ko/en 중심)
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, is_active, created_at, updated_at) VALUES
  ('i10-cat-001','master.pet_type','master','펫 종류','Pet Type',1,datetime('now'),datetime('now')),
  ('i10-cat-002','master.pet_breed','master','품종','Breed',1,datetime('now'),datetime('now')),
  ('i10-cat-003','master.pet_gender','master','성별','Gender',1,datetime('now'),datetime('now')),
  ('i10-cat-004','master.neuter_status','master','중성화 여부','Neuter Status',1,datetime('now'),datetime('now')),
  ('i10-cat-005','master.life_stage','master','생애 단계','Life Stage',1,datetime('now'),datetime('now')),
  ('i10-cat-006','master.body_size','master','체형/크기','Body Size',1,datetime('now'),datetime('now')),
  ('i10-cat-007','master.pet_color','master','대표 색상','Primary Color',1,datetime('now'),datetime('now')),
  ('i10-cat-008','master.allergy_type','master','알러지','Allergy',1,datetime('now'),datetime('now')),
  ('i10-cat-009','master.disease_type','master','질병 이력','Disease History',1,datetime('now'),datetime('now')),
  ('i10-cat-010','master.symptom_type','master','증상 태그','Symptom Tag',1,datetime('now'),datetime('now')),
  ('i10-cat-011','master.vaccination_type','master','예방접종','Vaccination',1,datetime('now'),datetime('now')),
  ('i10-cat-012','master.medication_status','master','복용 약물 상태','Medication Status',1,datetime('now'),datetime('now')),
  ('i10-cat-013','master.weight_unit','master','체중 단위','Weight Unit',1,datetime('now'),datetime('now')),
  ('i10-cat-014','master.health_condition_level','master','건강 상태 요약','Health Condition Level',1,datetime('now'),datetime('now')),
  ('i10-cat-015','master.activity_level','master','활동량','Activity Level',1,datetime('now'),datetime('now')),
  ('i10-cat-016','master.diet_type','master','식사 유형','Diet Type',1,datetime('now'),datetime('now')),
  ('i10-cat-017','master.temperament_type','master','성격/기질','Temperament',1,datetime('now'),datetime('now')),
  ('i10-cat-018','master.living_style','master','실내/실외','Living Style',1,datetime('now'),datetime('now')),
  ('i10-cat-019','master.ownership_type','master','보호/입양 형태','Ownership Type',1,datetime('now'),datetime('now')),
  ('i10-cat-020','master.coat_length','master','털 길이','Coat Length',1,datetime('now'),datetime('now')),
  ('i10-cat-021','master.coat_type','master','털 타입','Coat Type',1,datetime('now'),datetime('now')),
  ('i10-cat-022','master.grooming_cycle','master','미용 주기','Grooming Cycle',1,datetime('now'),datetime('now')),

  ('i10-item-001','master.pet_type.dog','master','강아지','Dog',1,datetime('now'),datetime('now')),
  ('i10-item-002','master.pet_type.cat','master','고양이','Cat',1,datetime('now'),datetime('now')),
  ('i10-item-003','master.pet_type.bird','master','새','Bird',1,datetime('now'),datetime('now')),
  ('i10-item-004','master.pet_type.rabbit','master','토끼','Rabbit',1,datetime('now'),datetime('now')),
  ('i10-item-005','master.pet_type.reptile','master','파충류','Reptile',1,datetime('now'),datetime('now')),
  ('i10-item-006','master.pet_type.other','master','기타','Other',1,datetime('now'),datetime('now')),

  ('i10-item-007','master.pet_breed.pomeranian','master','포메라니안','Pomeranian',1,datetime('now'),datetime('now')),
  ('i10-item-008','master.pet_breed.poodle','master','푸들','Poodle',1,datetime('now'),datetime('now')),
  ('i10-item-009','master.pet_breed.golden_retriever','master','골든 리트리버','Golden Retriever',1,datetime('now'),datetime('now')),
  ('i10-item-010','master.pet_breed.korean_shorthair','master','코리안 숏헤어','Korean Shorthair',1,datetime('now'),datetime('now')),
  ('i10-item-011','master.pet_breed.russian_blue','master','러시안 블루','Russian Blue',1,datetime('now'),datetime('now')),
  ('i10-item-012','master.pet_breed.persian','master','페르시안','Persian',1,datetime('now'),datetime('now')),

  ('i10-item-013','master.pet_gender.male','master','수컷','Male',1,datetime('now'),datetime('now')),
  ('i10-item-014','master.pet_gender.female','master','암컷','Female',1,datetime('now'),datetime('now')),
  ('i10-item-015','master.pet_gender.unknown','master','미상','Unknown',1,datetime('now'),datetime('now')),

  ('i10-item-016','master.neuter_status.yes','master','예','Yes',1,datetime('now'),datetime('now')),
  ('i10-item-017','master.neuter_status.no','master','아니오','No',1,datetime('now'),datetime('now')),
  ('i10-item-018','master.neuter_status.unknown','master','미상','Unknown',1,datetime('now'),datetime('now')),

  ('i10-item-019','master.life_stage.baby','master','베이비','Baby',1,datetime('now'),datetime('now')),
  ('i10-item-020','master.life_stage.junior','master','주니어','Junior',1,datetime('now'),datetime('now')),
  ('i10-item-021','master.life_stage.adult','master','성체','Adult',1,datetime('now'),datetime('now')),
  ('i10-item-022','master.life_stage.senior','master','시니어','Senior',1,datetime('now'),datetime('now')),

  ('i10-item-023','master.body_size.tiny','master','초소형','Tiny',1,datetime('now'),datetime('now')),
  ('i10-item-024','master.body_size.small','master','소형','Small',1,datetime('now'),datetime('now')),
  ('i10-item-025','master.body_size.medium','master','중형','Medium',1,datetime('now'),datetime('now')),
  ('i10-item-026','master.body_size.large','master','대형','Large',1,datetime('now'),datetime('now')),
  ('i10-item-027','master.body_size.giant','master','초대형','Giant',1,datetime('now'),datetime('now')),

  ('i10-item-028','master.pet_color.white','master','흰색','White',1,datetime('now'),datetime('now')),
  ('i10-item-029','master.pet_color.black','master','검정','Black',1,datetime('now'),datetime('now')),
  ('i10-item-030','master.pet_color.brown','master','갈색','Brown',1,datetime('now'),datetime('now')),
  ('i10-item-031','master.pet_color.gray','master','회색','Gray',1,datetime('now'),datetime('now')),
  ('i10-item-032','master.pet_color.cream','master','크림','Cream',1,datetime('now'),datetime('now')),
  ('i10-item-033','master.pet_color.orange','master','오렌지','Orange',1,datetime('now'),datetime('now')),
  ('i10-item-034','master.pet_color.mixed','master','혼합','Mixed',1,datetime('now'),datetime('now')),

  ('i10-item-035','master.weight_unit.kg','master','킬로그램','kg',1,datetime('now'),datetime('now')),
  ('i10-item-036','master.weight_unit.lb','master','파운드','lb',1,datetime('now'),datetime('now')),

  ('i10-item-037','master.health_condition_level.healthy','master','건강함','Healthy',1,datetime('now'),datetime('now')),
  ('i10-item-038','master.health_condition_level.monitoring','master','관찰 필요','Monitoring',1,datetime('now'),datetime('now')),
  ('i10-item-039','master.health_condition_level.needs_care','master','관리 필요','Needs Care',1,datetime('now'),datetime('now')),
  ('i10-item-040','master.health_condition_level.chronic_condition','master','만성 질환','Chronic Condition',1,datetime('now'),datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0010_pet_profile_master');
