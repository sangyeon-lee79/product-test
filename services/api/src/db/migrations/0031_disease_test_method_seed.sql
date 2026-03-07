-- Disease 6-level hierarchy support seed
-- L1 disease_group -> L2 disease_type -> L3 disease_device_type(test method) -> L4 disease_measurement_type -> L5 disease_measurement_context

-- 1) Ensure diabetes exists (L2)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-diabetes', c.id, g.id, 'diabetes', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items g ON g.code = 'endocrine' AND g.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1)
WHERE c.code = 'disease_type';

-- 2) L3 test methods (stored in disease_device_type)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-blood-test', c.id, d.id, 'blood_test', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-urine-test', c.id, d.id, 'urine_test', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-saliva-test', c.id, d.id, 'saliva_test', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-stool-test', c.id, d.id, 'stool_test', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-sensor-measurement', c.id, d.id, 'sensor_measurement', 5, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-wearable-measurement', c.id, d.id, 'wearable_measurement', 6, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-hospital-test', c.id, d.id, 'hospital_test', 7, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-home-test', c.id, d.id, 'home_test', 8, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-cgm-sensor', c.id, d.id, 'cgm_sensor', 9, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dtest-libre-sensor', c.id, d.id, 'libre_sensor', 10, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

-- Existing keys aligned to L3 under diabetes
UPDATE master_items
SET parent_item_id = (SELECT id FROM master_items WHERE code='diabetes' AND category_id=(SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)),
    updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_device_type' LIMIT 1)
  AND code IN ('glucose_meter', 'continuous_glucose_monitor', 'insulin_pen', 'insulin_syringe', 'glucose_strip')
  AND parent_item_id != (SELECT id FROM master_items WHERE code='diabetes' AND category_id=(SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1));

-- 3) L4 measurement should follow L3 (blood_test -> blood_glucose)
UPDATE master_items
SET parent_item_id = (SELECT id FROM master_items WHERE code='blood_test' AND category_id=(SELECT id FROM master_categories WHERE code='disease_device_type' LIMIT 1)),
    updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_measurement_type' LIMIT 1)
  AND code = 'blood_glucose'
  AND parent_item_id != (SELECT id FROM master_items WHERE code='blood_test' AND category_id=(SELECT id FROM master_categories WHERE code='disease_device_type' LIMIT 1));

-- 4) i18n upsert for L3 methods
INSERT INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
) VALUES
  ('i31-001', 'master.disease_device_type.blood_test', 'master', '혈액검사', 'Blood Test', '血液検査', '血液检查', '血液檢查', 'Análisis de sangre', 'Analyse sanguine', 'Bluttest', 'Exame de sangue', 'Xét nghiệm máu', 'ตรวจเลือด', 'Tes darah', 'فحص الدم', 1, datetime('now'), datetime('now')),
  ('i31-002', 'master.disease_device_type.urine_test', 'master', '소변검사', 'Urine Test', '尿検査', '尿液检查', '尿液檢查', 'Análisis de orina', 'Analyse d''urine', 'Urintest', 'Exame de urina', 'Xét nghiệm nước tiểu', 'ตรวจปัสสาวะ', 'Tes urin', 'فحص البول', 1, datetime('now'), datetime('now')),
  ('i31-003', 'master.disease_device_type.saliva_test', 'master', '타액검사', 'Saliva Test', '唾液検査', '唾液检查', '唾液檢查', 'Prueba de saliva', 'Test salivaire', 'Speicheltest', 'Teste de saliva', 'Xét nghiệm nước bọt', 'ตรวจน้ำลาย', 'Tes saliva', 'فحص اللعاب', 1, datetime('now'), datetime('now')),
  ('i31-004', 'master.disease_device_type.stool_test', 'master', '대변검사', 'Stool Test', '便検査', '粪便检查', '糞便檢查', 'Análisis de heces', 'Analyse des selles', 'Stuhltest', 'Exame de fezes', 'Xét nghiệm phân', 'ตรวจอุจจาระ', 'Tes feses', 'فحص البراز', 1, datetime('now'), datetime('now')),
  ('i31-005', 'master.disease_device_type.sensor_measurement', 'master', '센서 측정', 'Sensor Measurement', 'センサー測定', '传感器测量', '感測器測量', 'Medición por sensor', 'Mesure par capteur', 'Sensor-Messung', 'Medição por sensor', 'Đo bằng cảm biến', 'การวัดด้วยเซนเซอร์', 'Pengukuran sensor', 'قياس بالمستشعر', 1, datetime('now'), datetime('now')),
  ('i31-006', 'master.disease_device_type.wearable_measurement', 'master', '웨어러블 측정', 'Wearable Measurement', 'ウェアラブル測定', '可穿戴测量', '穿戴式測量', 'Medición wearable', 'Mesure wearable', 'Wearable-Messung', 'Medição wearable', 'Đo bằng thiết bị đeo', 'การวัดด้วยอุปกรณ์สวมใส่', 'Pengukuran wearable', 'قياس عبر جهاز قابل للارتداء', 1, datetime('now'), datetime('now')),
  ('i31-007', 'master.disease_device_type.hospital_test', 'master', '병원 검사', 'Clinical Test', '臨床検査', '临床检查', '臨床檢查', 'Prueba clínica', 'Test clinique', 'Klinischer Test', 'Teste clínico', 'Xét nghiệm lâm sàng', 'การตรวจทางคลินิก', 'Tes klinis', 'فحص سريري', 1, datetime('now'), datetime('now')),
  ('i31-008', 'master.disease_device_type.home_test', 'master', '가정 검사', 'Home Test', '家庭検査', '家庭检测', '家庭檢測', 'Prueba en casa', 'Test à domicile', 'Heimtest', 'Teste em casa', 'Xét nghiệm tại nhà', 'การตรวจที่บ้าน', 'Tes di rumah', 'فحص منزلي', 1, datetime('now'), datetime('now')),
  ('i31-009', 'master.disease_device_type.cgm_sensor', 'master', 'CGM 센서', 'CGM Sensor', 'CGMセンサー', 'CGM传感器', 'CGM感測器', 'Sensor CGM', 'Capteur CGM', 'CGM-Sensor', 'Sensor CGM', 'Cảm biến CGM', 'เซนเซอร์ CGM', 'Sensor CGM', 'مستشعر CGM', 1, datetime('now'), datetime('now')),
  ('i31-010', 'master.disease_device_type.libre_sensor', 'master', '리브레 센서', 'Libre Sensor', 'リブレセンサー', 'Libre传感器', 'Libre感測器', 'Sensor Libre', 'Capteur Libre', 'Libre-Sensor', 'Sensor Libre', 'Cảm biến Libre', 'เซนเซอร์ Libre', 'Sensor Libre', 'مستشعر Libre', 1, datetime('now'), datetime('now')),
  ('i31-011', 'master.disease_device_type.glucose_meter', 'master', '혈당 측정기', 'Glucose Meter', '血糖測定器', '血糖仪', '血糖儀', 'Medidor de glucosa', 'Glucomètre', 'Blutzuckermessgerät', 'Medidor de glicose', 'Máy đo đường huyết', 'เครื่องวัดน้ำตาลในเลือด', 'Alat ukur glukosa', 'جهاز قياس السكر', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko,
  en = excluded.en,
  ja = excluded.ja,
  zh_cn = excluded.zh_cn,
  zh_tw = excluded.zh_tw,
  es = excluded.es,
  fr = excluded.fr,
  de = excluded.de,
  pt = excluded.pt,
  vi = excluded.vi,
  th = excluded.th,
  id_lang = excluded.id_lang,
  ar = excluded.ar,
  is_active = 1,
  updated_at = datetime('now');
