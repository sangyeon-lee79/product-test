-- Migration 0025: Backfill missing master category translations (ko + multilingual)

INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  ('i25-cat-001', 'master.disease_group', 'master', '질병군', 'Disease Group', '疾患群', '疾病组', '疾病群組', 'Grupo de enfermedad', 'Groupe de maladies', 'Krankheitsgruppe', 'Grupo de doença', 'Nhóm bệnh', 'กลุ่มโรค', 'Kelompok penyakit', 'مجموعة الأمراض', 1, datetime('now'), datetime('now')),
  ('i25-cat-002', 'master.disease_device_type', 'master', '질병 장치', 'Disease Device Type', '疾患デバイスタイプ', '疾病设备类型', '疾病裝置類型', 'Tipo de dispositivo de enfermedad', 'Type de dispositif de maladie', 'Krankheitsgerätetyp', 'Tipo de dispositivo de doença', 'Loại thiết bị bệnh', 'ประเภทอุปกรณ์โรค', 'Tipe perangkat penyakit', 'نوع جهاز المرض', 1, datetime('now'), datetime('now')),
  ('i25-cat-003', 'master.disease_measurement_type', 'master', '질병 측정 항목', 'Disease Measurement Type', '疾患測定項目', '疾病测量项', '疾病測量項目', 'Tipo de medición de enfermedad', 'Type de mesure de maladie', 'Krankheitsmesstyp', 'Tipo de medição de doença', 'Loại đo bệnh', 'ประเภทการวัดโรค', 'Jenis pengukuran penyakit', 'نوع قياس المرض', 1, datetime('now'), datetime('now')),
  ('i25-cat-004', 'master.disease_measurement_context', 'master', '질병 측정 컨텍스트', 'Disease Measurement Context', '疾患測定コンテキスト', '疾病测量上下文', '疾病測量情境', 'Contexto de medición de enfermedad', 'Contexte de mesure de maladie', 'Krankheitsmesskontext', 'Contexto de medição de doença', 'Ngữ cảnh đo bệnh', 'บริบทการวัดโรค', 'Konteks pengukuran penyakit', 'سياق قياس المرض', 1, datetime('now'), datetime('now')),
  ('i25-cat-005', 'master.disease_judgement_rule_type', 'master', '질병 판단 기준', 'Disease Judgement Rule Type', '疾患判定基準', '疾病判断规则类型', '疾病判斷規則類型', 'Tipo de regla de juicio de enfermedad', 'Type de règle d''évaluation de maladie', 'Typ der Krankheitsbewertungsregel', 'Tipo de regra de julgamento da doença', 'Loại quy tắc đánh giá bệnh', 'ประเภทเกณฑ์ตัดสินโรค', 'Jenis aturan penilaian penyakit', 'نوع قاعدة الحكم على المرض', 1, datetime('now'), datetime('now')),
  ('i25-cat-006', 'master.diet_subtype', 'master', '식단 하위 유형', 'Diet Subtype', '食事サブタイプ', '饮食子类型', '飲食子類型', 'Subtipo de dieta', 'Sous-type de régime', 'Ernährungsuntertyp', 'Subtipo de dieta', 'Loại phụ chế độ ăn', 'ประเภทย่อยอาหาร', 'Subtipe diet', 'نوع فرعي للنظام الغذائي', 1, datetime('now'), datetime('now')),
  ('i25-cat-007', 'master.allergy_group', 'master', '알러지 그룹', 'Allergy Group', 'アレルギー群', '过敏组', '過敏群組', 'Grupo de alergia', 'Groupe d''allergies', 'Allergiegruppe', 'Grupo de alergia', 'Nhóm dị ứng', 'กลุ่มภูมิแพ้', 'Kelompok alergi', 'مجموعة الحساسية', 1, datetime('now'), datetime('now'));

UPDATE i18n_translations
SET
  ko = COALESCE(NULLIF(ko, ''), CASE key
    WHEN 'master.disease_group' THEN '질병군'
    WHEN 'master.disease_device_type' THEN '질병 장치'
    WHEN 'master.disease_measurement_type' THEN '질병 측정 항목'
    WHEN 'master.disease_measurement_context' THEN '질병 측정 컨텍스트'
    WHEN 'master.disease_judgement_rule_type' THEN '질병 판단 기준'
    WHEN 'master.diet_subtype' THEN '식단 하위 유형'
    WHEN 'master.allergy_group' THEN '알러지 그룹'
    ELSE ko
  END),
  updated_at = datetime('now')
WHERE key IN (
  'master.disease_group',
  'master.disease_device_type',
  'master.disease_measurement_type',
  'master.disease_measurement_context',
  'master.disease_judgement_rule_type',
  'master.diet_subtype',
  'master.allergy_group'
);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0025_backfill_master_category_i18n');
