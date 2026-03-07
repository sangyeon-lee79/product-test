-- 측정 중심 질병 seed (disease_group -> measurement -> device/context + judgement)

-- 1) disease_group: endocrine 보장
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dgroup-endocrine', c.id, NULL, 'endocrine', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
WHERE c.code = 'disease_group';

-- 2) disease_measurement_type
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dm-blood-glucose', c.id, g.id, 'blood_glucose', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items g ON g.code = 'endocrine' AND g.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1)
WHERE c.code = 'disease_measurement_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dm-insulin-dose', c.id, g.id, 'insulin_dose', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items g ON g.code = 'endocrine' AND g.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1)
WHERE c.code = 'disease_measurement_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dm-ketone', c.id, g.id, 'ketone', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items g ON g.code = 'endocrine' AND g.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1)
WHERE c.code = 'disease_measurement_type';

-- 3) disease_device_type (blood_glucose 하위)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-ddev-glucose-meter', c.id, m.id, 'glucose_meter', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-ddev-cgm', c.id, m.id, 'continuous_glucose_monitor', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-ddev-insulin-pen', c.id, m.id, 'insulin_pen', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_device_type';

-- 4) disease_measurement_context (blood_glucose 하위)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dctx-fasting', c.id, m.id, 'fasting', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_measurement_context';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dctx-before-meal', c.id, m.id, 'before_meal', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_measurement_context';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dctx-after-meal', c.id, m.id, 'after_meal', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_measurement_context';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dctx-bedtime', c.id, m.id, 'bedtime', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_measurement_context';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dctx-random', c.id, m.id, 'random', 5, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
JOIN master_items m ON m.code = 'blood_glucose' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
WHERE c.code = 'disease_measurement_context';

-- 5) judgement rule type (watch 보강)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-judge-watch', c.id, NULL, 'watch', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c
WHERE c.code = 'disease_judgement_rule_type';

-- 6) i18n (ko/en)
INSERT OR IGNORE INTO i18n_translations
  (id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at)
VALUES
  ('i30-001', 'master.disease_group.endocrine', 'master', '내분비', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 'Endocrine', 1, datetime('now'), datetime('now')),
  ('i30-002', 'master.disease_measurement_type.blood_glucose', 'master', '혈당', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 'Blood Glucose', 1, datetime('now'), datetime('now')),
  ('i30-003', 'master.disease_measurement_type.insulin_dose', 'master', '인슐린', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 'Insulin Dose', 1, datetime('now'), datetime('now')),
  ('i30-004', 'master.disease_measurement_type.ketone', 'master', '케톤', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 'Ketone', 1, datetime('now'), datetime('now')),
  ('i30-005', 'master.disease_device_type.glucose_meter', 'master', '혈당측정기', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 'Glucose Meter', 1, datetime('now'), datetime('now')),
  ('i30-006', 'master.disease_device_type.continuous_glucose_monitor', 'master', 'CGM', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 'Continuous Glucose Monitor', 1, datetime('now'), datetime('now')),
  ('i30-007', 'master.disease_device_type.insulin_pen', 'master', '인슐린 펜', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 'Insulin Pen', 1, datetime('now'), datetime('now')),
  ('i30-008', 'master.disease_measurement_context.fasting', 'master', '공복', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 'Fasting', 1, datetime('now'), datetime('now')),
  ('i30-009', 'master.disease_measurement_context.before_meal', 'master', '식전', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 'Before Meal', 1, datetime('now'), datetime('now')),
  ('i30-010', 'master.disease_measurement_context.after_meal', 'master', '식후', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 'After Meal', 1, datetime('now'), datetime('now')),
  ('i30-011', 'master.disease_measurement_context.bedtime', 'master', '취침전', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 'Bedtime', 1, datetime('now'), datetime('now')),
  ('i30-012', 'master.disease_measurement_context.random', 'master', '랜덤', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 'Random', 1, datetime('now'), datetime('now')),
  ('i30-013', 'master.disease_judgement_rule_type.watch', 'master', '관찰', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 'Watch', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0030_disease_measurement_centered_seed');
