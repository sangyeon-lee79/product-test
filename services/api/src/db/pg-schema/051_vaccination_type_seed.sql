-- Comprehensive vaccination type L1 seed data
-- Adds core and non-core vaccines for dogs and cats
-- Existing: rabies, dhpp, bordetella, fvrcp

-- ============================================================
-- master_items: new vaccination types
-- ============================================================

INSERT INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
VALUES
  -- Dog Core
  ('mi-vac-dhppl', 'mc-vaccination-type', NULL, 'dhppl', 2, 'active', '{"pet_type":"dog","vaccine_class":"core"}', NOW(), NOW()),
  ('mi-vac-leptospirosis', 'mc-vaccination-type', NULL, 'leptospirosis', 3, 'active', '{"pet_type":"dog","vaccine_class":"core"}', NOW(), NOW()),
  -- Dog Non-Core
  ('mi-vac-canine-influenza', 'mc-vaccination-type', NULL, 'canine_influenza', 10, 'active', '{"pet_type":"dog","vaccine_class":"non_core"}', NOW(), NOW()),
  ('mi-vac-lyme', 'mc-vaccination-type', NULL, 'lyme', 11, 'active', '{"pet_type":"dog","vaccine_class":"non_core"}', NOW(), NOW()),
  ('mi-vac-canine-coronavirus', 'mc-vaccination-type', NULL, 'canine_coronavirus', 12, 'active', '{"pet_type":"dog","vaccine_class":"non_core"}', NOW(), NOW()),
  -- Cat Non-Core
  ('mi-vac-felv', 'mc-vaccination-type', NULL, 'felv', 20, 'active', '{"pet_type":"cat","vaccine_class":"non_core"}', NOW(), NOW()),
  ('mi-vac-fip', 'mc-vaccination-type', NULL, 'fip', 21, 'active', '{"pet_type":"cat","vaccine_class":"non_core"}', NOW(), NOW()),
  ('mi-vac-chlamydia', 'mc-vaccination-type', NULL, 'chlamydia', 22, 'active', '{"pet_type":"cat","vaccine_class":"non_core"}', NOW(), NOW()),
  -- Common
  ('mi-vac-heartworm', 'mc-vaccination-type', NULL, 'heartworm', 30, 'active', '{"pet_type":"both","vaccine_class":"preventive"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Update existing items with metadata
UPDATE master_items SET metadata = '{"pet_type":"both","vaccine_class":"core"}', updated_at = NOW()
WHERE id = 'mi-vac-rabies' AND (metadata IS NULL OR metadata = '{}');

UPDATE master_items SET metadata = '{"pet_type":"dog","vaccine_class":"core"}', updated_at = NOW()
WHERE id = 'mi-vac-dhpp' AND (metadata IS NULL OR metadata = '{}');

UPDATE master_items SET metadata = '{"pet_type":"dog","vaccine_class":"non_core"}', updated_at = NOW()
WHERE id = 'mi-vac-bordetella' AND (metadata IS NULL OR metadata = '{}');

UPDATE master_items SET metadata = '{"pet_type":"cat","vaccine_class":"core"}', updated_at = NOW()
WHERE id = 'mi-vac-fvrcp' AND (metadata IS NULL OR metadata = '{}');

-- ============================================================
-- i18n_translations
-- ============================================================

INSERT INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  (md5('master.vaccination_type.dhppl'), 'master.vaccination_type.dhppl', 'master',
   'DHPPL (종합백신5종)', 'DHPPL (5-in-1)', 'DHPPL（5種混合）',
   'DHPPL（五联疫苗）', 'DHPPL（五合一）', 'DHPPL (5 en 1)', 'DHPPL (5 en 1)', 'DHPPL (5-fach)', 'DHPPL (5 em 1)',
   'DHPPL (5 trong 1)', 'DHPPL (5 รวม)', 'DHPPL (5 dalam 1)', 'DHPPL (5 في 1)',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.leptospirosis'), 'master.vaccination_type.leptospirosis', 'master',
   '렙토스피라', 'Leptospirosis', 'レプトスピラ',
   '钩端螺旋体病', '鉤端螺旋體病', 'Leptospirosis', 'Leptospirose', 'Leptospirose', 'Leptospirose',
   'Leptospirosis', 'เลปโตสไปโรซิส', 'Leptospirosis', 'داء البريميات',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.canine_influenza'), 'master.vaccination_type.canine_influenza', 'master',
   '개 인플루엔자 (CIV)', 'Canine Influenza (CIV)', '犬インフルエンザ (CIV)',
   '犬流感 (CIV)', '犬流感 (CIV)', 'Influenza Canina (CIV)', 'Grippe Canine (CIV)', 'Hundeinfluenza (CIV)', 'Influenza Canina (CIV)',
   'Cúm chó (CIV)', 'ไข้หวัดสุนัข (CIV)', 'Influenza Anjing (CIV)', 'إنفلونزا الكلاب (CIV)',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.lyme'), 'master.vaccination_type.lyme', 'master',
   '라임병', 'Lyme Disease', 'ライム病',
   '莱姆病', '萊姆病', 'Enfermedad de Lyme', 'Maladie de Lyme', 'Lyme-Borreliose', 'Doença de Lyme',
   'Bệnh Lyme', 'โรคไลม์', 'Penyakit Lyme', 'داء لايم',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.canine_coronavirus'), 'master.vaccination_type.canine_coronavirus', 'master',
   '개 코로나바이러스 (CCV)', 'Canine Coronavirus (CCV)', '犬コロナウイルス (CCV)',
   '犬冠状病毒 (CCV)', '犬冠狀病毒 (CCV)', 'Coronavirus Canino (CCV)', 'Coronavirus Canin (CCV)', 'Canines Coronavirus (CCV)', 'Coronavírus Canino (CCV)',
   'Coronavirus ở chó (CCV)', 'ไวรัสโคโรนาสุนัข (CCV)', 'Coronavirus Anjing (CCV)', 'فيروس كورونا الكلاب (CCV)',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.felv'), 'master.vaccination_type.felv', 'master',
   '고양이 백혈병 (FeLV)', 'Feline Leukemia (FeLV)', '猫白血病 (FeLV)',
   '猫白血病 (FeLV)', '貓白血病 (FeLV)', 'Leucemia Felina (FeLV)', 'Leucémie Féline (FeLV)', 'Feline Leukämie (FeLV)', 'Leucemia Felina (FeLV)',
   'Bệnh bạch cầu mèo (FeLV)', 'มะเร็งเม็ดเลือดขาวแมว (FeLV)', 'Leukemia Kucing (FeLV)', 'سرطان الدم القططي (FeLV)',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.fip'), 'master.vaccination_type.fip', 'master',
   '고양이 전염성 복막염 (FIP)', 'Feline Infectious Peritonitis (FIP)', '猫伝染性腹膜炎 (FIP)',
   '猫传染性腹膜炎 (FIP)', '貓傳染性腹膜炎 (FIP)', 'Peritonitis Infecciosa Felina (FIP)', 'Péritonite Infectieuse Féline (FIP)', 'Feline Infektiöse Peritonitis (FIP)', 'Peritonite Infecciosa Felina (FIP)',
   'Viêm phúc mạc truyền nhiễm mèo (FIP)', 'โรคเยื่อบุช่องท้องอักเสบแมว (FIP)', 'Peritonitis Infeksius Kucing (FIP)', 'التهاب الصفاق المعدي القططي (FIP)',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.chlamydia'), 'master.vaccination_type.chlamydia', 'master',
   '클라미디아', 'Chlamydia', 'クラミジア',
   '衣原体', '披衣菌', 'Clamidia', 'Chlamydia', 'Chlamydien', 'Clamídia',
   'Chlamydia', 'คลาไมเดีย', 'Klamidia', 'الكلاميديا',
   true, NOW(), NOW()),

  (md5('master.vaccination_type.heartworm'), 'master.vaccination_type.heartworm', 'master',
   '심장사상충 예방', 'Heartworm Prevention', 'フィラリア予防',
   '心丝虫预防', '心絲蟲預防', 'Prevención de Dirofilaria', 'Prévention du Ver du Cœur', 'Herzwurmprophylaxe', 'Prevenção de Dirofilária',
   'Phòng giun tim', 'ป้องกันพยาธิหนอนหัวใจ', 'Pencegahan Cacing Jantung', 'الوقاية من الديدان القلبية',
   true, NOW(), NOW())
ON CONFLICT DO NOTHING;
