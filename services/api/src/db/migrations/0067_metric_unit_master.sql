-- metric / unit 마스터 카테고리 + 아이템 시드
-- GuardianMainPage 로그 입력 폼에서 사용

-- ─── 카테고리 ────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO master_categories (id, code, sort_order, is_active, created_at, updated_at)
VALUES
  ('mc-metric', 'metric', 210, 1, datetime('now'), datetime('now')),
  ('mc-unit',   'unit',   211, 1, datetime('now'), datetime('now'));

-- ─── metric 아이템 ──────────────────────────────────────────────────────────
INSERT OR IGNORE INTO master_items (id, category_id, parent_id, code, sort_order, is_active, metadata, created_at, updated_at)
VALUES
  ('mi-metric-blood-glucose', (SELECT id FROM master_categories WHERE code='metric'), NULL, 'blood_glucose', 1, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-insulin-dose',  (SELECT id FROM master_categories WHERE code='metric'), NULL, 'insulin_dose',  2, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-meal-amount',   (SELECT id FROM master_categories WHERE code='metric'), NULL, 'meal_amount',   3, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-food-weight',   (SELECT id FROM master_categories WHERE code='metric'), NULL, 'food_weight',   4, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-water-intake',  (SELECT id FROM master_categories WHERE code='metric'), NULL, 'water_intake',  5, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-duration',      (SELECT id FROM master_categories WHERE code='metric'), NULL, 'duration',      6, 1, '{}', datetime('now'), datetime('now')),
  ('mi-metric-body-weight',   (SELECT id FROM master_categories WHERE code='metric'), NULL, 'body_weight',   7, 1, '{}', datetime('now'), datetime('now'));

-- ─── unit 아이템 ────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO master_items (id, category_id, parent_id, code, sort_order, is_active, metadata, created_at, updated_at)
VALUES
  ('mi-unit-mg-dl',  (SELECT id FROM master_categories WHERE code='unit'), NULL, 'mg_dl',  1, 1, '{"symbol":"mg/dL"}', datetime('now'), datetime('now')),
  ('mi-unit-mmol-l', (SELECT id FROM master_categories WHERE code='unit'), NULL, 'mmol_l', 2, 1, '{"symbol":"mmol/L"}', datetime('now'), datetime('now')),
  ('mi-unit-iu',     (SELECT id FROM master_categories WHERE code='unit'), NULL, 'iu',     3, 1, '{"symbol":"IU"}', datetime('now'), datetime('now')),
  ('mi-unit-g',      (SELECT id FROM master_categories WHERE code='unit'), NULL, 'g',      4, 1, '{"symbol":"g"}', datetime('now'), datetime('now')),
  ('mi-unit-kg',     (SELECT id FROM master_categories WHERE code='unit'), NULL, 'kg',     5, 1, '{"symbol":"kg"}', datetime('now'), datetime('now')),
  ('mi-unit-ml',     (SELECT id FROM master_categories WHERE code='unit'), NULL, 'ml',     6, 1, '{"symbol":"mL"}', datetime('now'), datetime('now')),
  ('mi-unit-kcal',   (SELECT id FROM master_categories WHERE code='unit'), NULL, 'kcal',   7, 1, '{"symbol":"kcal"}', datetime('now'), datetime('now')),
  ('mi-unit-min',    (SELECT id FROM master_categories WHERE code='unit'), NULL, 'min',    8, 1, '{"symbol":"min"}', datetime('now'), datetime('now'));

-- ─── i18n 번역 ──────────────────────────────────────────────────────────────
INSERT INTO i18n_translations
  (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  -- categories
  ('i67-cat-metric', 'master.metric', 'master', '측정 항목', 'Metric', 'メトリック', '指标', '指標', 'Métrica', 'Métrique', 'Metrik', 'Métrica', 'Chỉ số', 'ตัวชี้วัด', 'Metrik', 'مقياس', 1, datetime('now'), datetime('now')),
  ('i67-cat-unit', 'master.unit', 'master', '단위', 'Unit', '単位', '单位', '單位', 'Unidad', 'Unité', 'Einheit', 'Unidade', 'Đơn vị', 'หน่วย', 'Satuan', 'وحدة', 1, datetime('now'), datetime('now')),
  -- metric items
  ('i67-m-blood-glucose', 'master.metric.blood_glucose', 'master', '혈당', 'Blood Glucose', '血糖', '血糖', '血糖', 'Glucosa', 'Glycémie', 'Blutzucker', 'Glicose', 'Đường huyết', 'น้ำตาลในเลือด', 'Glukosa darah', 'سكر الدم', 1, datetime('now'), datetime('now')),
  ('i67-m-insulin-dose', 'master.metric.insulin_dose', 'master', '인슐린 용량', 'Insulin Dose', 'インスリン投与量', '胰岛素剂量', '胰島素劑量', 'Dosis de insulina', 'Dose d''insuline', 'Insulindosis', 'Dose de insulina', 'Liều insulin', 'ปริมาณอินซูลิน', 'Dosis insulin', 'جرعة الأنسولين', 1, datetime('now'), datetime('now')),
  ('i67-m-meal-amount', 'master.metric.meal_amount', 'master', '식사량', 'Meal Amount', '食事量', '饭量', '飯量', 'Cantidad de comida', 'Quantité de repas', 'Mahlzeitmenge', 'Quantidade de refeição', 'Lượng thức ăn', 'ปริมาณอาหาร', 'Jumlah makan', 'كمية الوجبة', 1, datetime('now'), datetime('now')),
  ('i67-m-food-weight', 'master.metric.food_weight', 'master', '사료 중량', 'Food Weight', '餌の重量', '食物重量', '食物重量', 'Peso del alimento', 'Poids de la nourriture', 'Futtergewicht', 'Peso do alimento', 'Trọng lượng thức ăn', 'น้ำหนักอาหาร', 'Berat makanan', 'وزن الطعام', 1, datetime('now'), datetime('now')),
  ('i67-m-water-intake', 'master.metric.water_intake', 'master', '음수량', 'Water Intake', '飲水量', '饮水量', '飲水量', 'Ingesta de agua', 'Consommation d''eau', 'Wasseraufnahme', 'Consumo de água', 'Lượng nước uống', 'ปริมาณน้ำดื่ม', 'Asupan air', 'كمية الماء', 1, datetime('now'), datetime('now')),
  ('i67-m-duration', 'master.metric.duration', 'master', '활동 시간', 'Duration', '活動時間', '活动时间', '活動時間', 'Duración', 'Durée', 'Dauer', 'Duração', 'Thời lượng', 'ระยะเวลา', 'Durasi', 'المدة', 1, datetime('now'), datetime('now')),
  ('i67-m-body-weight', 'master.metric.body_weight', 'master', '체중', 'Body Weight', '体重', '体重', '體重', 'Peso corporal', 'Poids corporel', 'Körpergewicht', 'Peso corporal', 'Cân nặng', 'น้ำหนักตัว', 'Berat badan', 'وزن الجسم', 1, datetime('now'), datetime('now')),
  -- unit items
  ('i67-u-mg-dl', 'master.unit.mg_dl', 'master', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 'mg/dL', 1, datetime('now'), datetime('now')),
  ('i67-u-mmol-l', 'master.unit.mmol_l', 'master', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 'mmol/L', 1, datetime('now'), datetime('now')),
  ('i67-u-iu', 'master.unit.iu', 'master', 'IU', 'IU', 'IU', 'IU', 'IU', 'UI', 'UI', 'IE', 'UI', 'IU', 'IU', 'IU', 'وحدة دولية', 1, datetime('now'), datetime('now')),
  ('i67-u-g', 'master.unit.g', 'master', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'غ', 1, datetime('now'), datetime('now')),
  ('i67-u-kg', 'master.unit.kg', 'master', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'kg', 'كغ', 1, datetime('now'), datetime('now')),
  ('i67-u-ml', 'master.unit.ml', 'master', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'mL', 'مل', 1, datetime('now'), datetime('now')),
  ('i67-u-kcal', 'master.unit.kcal', 'master', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'kcal', 'كيلو كالوري', 1, datetime('now'), datetime('now')),
  ('i67-u-min', 'master.unit.min', 'master', '분', 'min', '分', '分钟', '分鐘', 'min', 'min', 'Min', 'min', 'phút', 'นาที', 'mnt', 'دقيقة', 1, datetime('now'), datetime('now'))
ON CONFLICT(key) DO UPDATE SET
  ko = excluded.ko, en = excluded.en, ja = excluded.ja,
  zh_cn = excluded.zh_cn, zh_tw = excluded.zh_tw,
  es = excluded.es, fr = excluded.fr, de = excluded.de, pt = excluded.pt,
  vi = excluded.vi, th = excluded.th, id_lang = excluded.id_lang, ar = excluded.ar,
  is_active = 1, updated_at = datetime('now');

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0067_metric_unit_master');
