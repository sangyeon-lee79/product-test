-- Migration 0023: Disease management master structure + judgement rules + glucose logs

-- 1) Category extensions
INSERT OR IGNORE INTO master_categories (id, code, sort_order, status, created_at, updated_at)
VALUES
  ('mc-disease-group', 'disease_group', 123, 'active', datetime('now'), datetime('now')),
  ('mc-disease-type', 'disease_type', 124, 'active', datetime('now'), datetime('now')),
  ('mc-disease-device-type', 'disease_device_type', 125, 'active', datetime('now'), datetime('now')),
  ('mc-disease-measurement-type', 'disease_measurement_type', 126, 'active', datetime('now'), datetime('now')),
  ('mc-disease-measurement-context', 'disease_measurement_context', 127, 'active', datetime('now'), datetime('now')),
  ('mc-disease-judgement-rule-type', 'disease_judgement_rule_type', 128, 'active', datetime('now'), datetime('now')),
  ('mc-diet-subtype', 'diet_subtype', 129, 'active', datetime('now'), datetime('now')),
  ('mc-allergy-group', 'allergy_group', 130, 'active', datetime('now'), datetime('now'));

-- 2) Disease group seed
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-endocrine', c.id, NULL, 'endocrine', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-digestive', c.id, NULL, 'digestive', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-heart', c.id, NULL, 'heart', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-kidney-urinary', c.id, NULL, 'kidney_urinary', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-skin', c.id, NULL, 'skin', 5, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-musculoskeletal', c.id, NULL, 'musculoskeletal', 6, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-respiratory', c.id, NULL, 'respiratory', 7, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-neurology', c.id, NULL, 'neurology', 8, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-eye', c.id, NULL, 'ophthalmology', 9, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-dental', c.id, NULL, 'dental', 10, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

-- 3) Disease type seed (parent: disease_group)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-diabetes', c.id, p.id, 'diabetes', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'disease_type' AND p.code = 'endocrine' AND p.category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-thyroid', c.id, p.id, 'thyroid_disorder', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'disease_type' AND p.code = 'endocrine' AND p.category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-pancreatitis', c.id, p.id, 'pancreatitis', 10, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'disease_type' AND p.code = 'digestive' AND p.category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-gastritis', c.id, p.id, 'gastritis', 11, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'disease_type' AND p.code = 'digestive' AND p.category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-disease-enteritis', c.id, p.id, 'enteritis', 12, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code = 'disease_type' AND p.code = 'digestive' AND p.category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1);

-- 4) Disease device seed (parent: diabetes)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-device-glucose-meter', c.id, d.id, 'glucose_meter', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_device_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-device-glucose-strip', c.id, d.id, 'glucose_strip', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_device_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-device-insulin-pen', c.id, d.id, 'insulin_pen', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_device_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-device-insulin-syringe', c.id, d.id, 'insulin_syringe', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_device_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);

-- 5) Disease measurement seed (parent: diabetes)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-measure-glucose-value', c.id, d.id, 'glucose_value', 1, 'active', '{"value_type":"number"}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_measurement_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-measure-measurement-time', c.id, d.id, 'measurement_time', 2, 'active', '{"value_type":"datetime"}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_measurement_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-measure-insulin-dose', c.id, d.id, 'insulin_dose', 3, 'active', '{"value_type":"number"}', datetime('now'), datetime('now')
FROM master_categories c, master_items d
WHERE c.code = 'disease_measurement_type' AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1);

-- 6) Measurement context seed
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-pre-meal', c.id, NULL, 'pre_meal', 1, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-post-1h', c.id, NULL, 'post_meal_1h', 2, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-post-2h', c.id, NULL, 'post_meal_2h', 3, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-bedtime', c.id, NULL, 'before_sleep', 4, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-fasting', c.id, NULL, 'fasting', 5, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-context-other', c.id, NULL, 'other', 6, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_measurement_context';

-- 7) Judgement level items
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-judge-normal', c.id, NULL, 'normal', 1, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_judgement_rule_type';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-judge-warning', c.id, NULL, 'warning', 2, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_judgement_rule_type';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-judge-danger', c.id, NULL, 'danger', 3, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_judgement_rule_type';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-judge-critical', c.id, NULL, 'critical', 4, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='disease_judgement_rule_type';

-- 8) Diet subtype seed (parent: diet_type)
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-raw-raynrebon', c.id, p.id, 'raynrebon', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='raw';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-raw-other', c.id, p.id, 'raw_other', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='raw';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-cooked-brand-a', c.id, p.id, 'brand_a', 10, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='cooked';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-cooked-brand-b', c.id, p.id, 'brand_b', 11, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='cooked';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-rx-diabetes', c.id, p.id, 'diabetes_prescription', 20, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='prescription';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-diet-sub-rx-kidney', c.id, p.id, 'kidney_prescription', 21, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items p
WHERE c.code='diet_subtype' AND p.category_id=(SELECT id FROM master_categories WHERE code='diet_type' LIMIT 1) AND p.code='prescription';

-- 9) Allergy group/type seed
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-group-protein', c.id, NULL, 'protein', 1, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='allergy_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-group-grain', c.id, NULL, 'grain', 2, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='allergy_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-group-dairy', c.id, NULL, 'dairy', 3, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='allergy_group';
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-group-environmental', c.id, NULL, 'environmental', 4, 'active', '{}', datetime('now'), datetime('now') FROM master_categories c WHERE c.code='allergy_group';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-chicken', c.id, g.id, 'chicken', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='protein' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-beef', c.id, g.id, 'beef', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='protein' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-duck', c.id, g.id, 'duck', 3, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='protein' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-salmon', c.id, g.id, 'salmon', 4, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='protein' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-wheat', c.id, g.id, 'wheat', 10, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='grain' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-corn', c.id, g.id, 'corn', 11, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='grain' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-rice', c.id, g.id, 'rice', 12, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='grain' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-milk', c.id, g.id, 'milk', 20, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='dairy' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-cheese', c.id, g.id, 'cheese', 21, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='dairy' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-dust', c.id, g.id, 'dust', 30, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='environmental' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-allergy-pollen', c.id, g.id, 'pollen', 31, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c, master_items g WHERE c.code='allergy_type' AND g.code='environmental' AND g.category_id=(SELECT id FROM master_categories WHERE code='allergy_group' LIMIT 1);

-- 10) mg/dL unit seed in weight_unit
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-unit-mgdl', c.id, NULL, 'mg_dl', 99, 'active', '{"symbol":"mg/dL"}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code='weight_unit';

-- 11) New domain tables
CREATE TABLE IF NOT EXISTS disease_judgement_rules (
  id                    TEXT PRIMARY KEY,
  disease_item_id       TEXT NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  measurement_item_id   TEXT NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  context_item_id       TEXT REFERENCES master_items(id),
  species_item_id       TEXT REFERENCES master_items(id),
  min_value             REAL,
  max_value             REAL,
  unit_item_id          TEXT NOT NULL REFERENCES master_items(id),
  judgement_level       TEXT NOT NULL,
  judgement_label       TEXT,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_djr_disease_measure ON disease_judgement_rules(disease_item_id, measurement_item_id, context_item_id);

CREATE TABLE IF NOT EXISTS pet_disease_histories (
  id                      TEXT PRIMARY KEY,
  pet_id                  TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_group_item_id   TEXT REFERENCES master_items(id),
  disease_item_id         TEXT NOT NULL REFERENCES master_items(id),
  diagnosed_at            TEXT,
  notes                   TEXT,
  is_active               INTEGER NOT NULL DEFAULT 1,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pdh_pet_active ON pet_disease_histories(pet_id, is_active);

CREATE TABLE IF NOT EXISTS pet_disease_devices (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id   TEXT NOT NULL REFERENCES master_items(id),
  device_item_id    TEXT NOT NULL REFERENCES master_items(id),
  serial_number     TEXT,
  nickname          TEXT,
  notes             TEXT,
  is_active         INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pdd_pet_disease ON pet_disease_devices(pet_id, disease_item_id, is_active);

CREATE TABLE IF NOT EXISTS pet_glucose_logs (
  id                         TEXT PRIMARY KEY,
  pet_id                     TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id            TEXT NOT NULL REFERENCES master_items(id),
  device_item_id             TEXT REFERENCES pet_disease_devices(id),
  glucose_value              REAL NOT NULL,
  glucose_unit_item_id       TEXT NOT NULL REFERENCES master_items(id),
  measured_at                TEXT NOT NULL,
  measured_context_item_id   TEXT REFERENCES master_items(id),
  notes                      TEXT,
  recorded_by_user_id        TEXT NOT NULL REFERENCES users(id),
  judgement_level            TEXT,
  judgement_label            TEXT,
  created_at                 TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                 TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pgl_pet_measured ON pet_glucose_logs(pet_id, measured_at DESC);

-- 12) Diabetes judgement rule seed (mg/dL)
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-fasting-normal',
  d.id,
  m.id,
  c.id,
  NULL,
  70, 120,
  u.id,
  'normal', '정상', 1, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'fasting' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-fasting-warning',
  d.id,
  m.id,
  c.id,
  NULL,
  121, 180,
  u.id,
  'warning', '주의', 2, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'fasting' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-fasting-danger',
  d.id,
  m.id,
  c.id,
  NULL,
  181, 250,
  u.id,
  'danger', '위험', 3, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'fasting' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-fasting-critical',
  d.id,
  m.id,
  c.id,
  NULL,
  251, NULL,
  u.id,
  'critical', '매우 위험', 4, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'fasting' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-premeal-normal',
  d.id,
  m.id,
  c.id,
  NULL,
  70, 120,
  u.id,
  'normal', '정상', 5, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'pre_meal' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-premeal-warning',
  d.id,
  m.id,
  c.id,
  NULL,
  121, 180,
  u.id,
  'warning', '주의', 6, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'pre_meal' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-postmeal-normal',
  d.id,
  m.id,
  c.id,
  NULL,
  80, 180,
  u.id,
  'normal', '정상', 7, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'post_meal_1h' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-postmeal-warning',
  d.id,
  m.id,
  c.id,
  NULL,
  181, 250,
  u.id,
  'warning', '주의', 8, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'post_meal_1h' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-postmeal-danger',
  d.id,
  m.id,
  c.id,
  NULL,
  251, 300,
  u.id,
  'danger', '위험', 9, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'post_meal_1h' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);
INSERT OR IGNORE INTO disease_judgement_rules (
  id, disease_item_id, measurement_item_id, context_item_id, species_item_id, min_value, max_value,
  unit_item_id, judgement_level, judgement_label, sort_order, notes, status, created_at, updated_at
)
SELECT
  'rule-diabetes-postmeal-critical',
  d.id,
  m.id,
  c.id,
  NULL,
  301, NULL,
  u.id,
  'critical', '매우 위험', 10, 'seed guideline', 'active', datetime('now'), datetime('now')
FROM master_items d, master_items m, master_items c, master_items u
WHERE d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND m.code = 'glucose_value' AND m.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_type' LIMIT 1)
  AND c.code = 'post_meal_1h' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
  AND u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1);

-- 13) Bangul sample relation seed
INSERT OR IGNORE INTO pet_disease_histories (
  id, pet_id, disease_group_item_id, disease_item_id, diagnosed_at, notes, is_active, created_at, updated_at
)
SELECT
  'seed-pdh-bangul-diabetes',
  p.id,
  dg.id,
  d.id,
  datetime('now'),
  '샘플 당뇨 질병 이력',
  1,
  datetime('now'),
  datetime('now')
FROM pets p, master_items dg, master_items d
WHERE p.id = 'seed-pet-bangul'
  AND dg.code = 'endocrine' AND dg.category_id = (SELECT id FROM master_categories WHERE code = 'disease_group' LIMIT 1)
  AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

INSERT OR IGNORE INTO pet_disease_devices (
  id, pet_id, disease_item_id, device_item_id, serial_number, nickname, notes, is_active, created_at, updated_at
)
SELECT
  'seed-pdd-bangul-meter',
  p.id,
  d.id,
  dv.id,
  NULL,
  '방울이 검사기',
  '샘플 장치',
  1,
  datetime('now'),
  datetime('now')
FROM pets p, master_items d, master_items dv
WHERE p.id = 'seed-pet-bangul'
  AND d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
  AND dv.code = 'glucose_meter' AND dv.category_id = (SELECT id FROM master_categories WHERE code = 'disease_device_type' LIMIT 1);

INSERT OR IGNORE INTO pet_glucose_logs (
  id, pet_id, disease_item_id, device_item_id, glucose_value, glucose_unit_item_id,
  measured_at, measured_context_item_id, notes, recorded_by_user_id,
  judgement_level, judgement_label, created_at, updated_at
)
SELECT
  'seed-pgl-bangul-1',
  p.id,
  d.id,
  dd.id,
  186,
  u.id,
  datetime('now', '-1 hour'),
  c.id,
  '샘플 혈당 기록',
  p.guardian_user_id,
  'warning',
  '주의',
  datetime('now'),
  datetime('now')
FROM pets p
LEFT JOIN pet_disease_devices dd ON dd.id = 'seed-pdd-bangul-meter' AND dd.pet_id = p.id
JOIN master_items d ON d.code = 'diabetes' AND d.category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1)
JOIN master_items u ON u.code = 'mg_dl' AND u.category_id = (SELECT id FROM master_categories WHERE code = 'weight_unit' LIMIT 1)
JOIN master_items c ON c.code = 'pre_meal' AND c.category_id = (SELECT id FROM master_categories WHERE code = 'disease_measurement_context' LIMIT 1)
WHERE p.id = 'seed-pet-bangul';

-- 14) i18n seed (key-based)
INSERT OR IGNORE INTO i18n_translations (id, key, page, ko, en, ja, zh_cn, zh_tw, is_active, created_at, updated_at)
VALUES
  ('i18n-disease-001', 'master.disease_group.endocrine', 'master', '내분비 질환', 'Endocrine Disorders', '内分泌疾患', '内分泌疾病', '內分泌疾病', 1, datetime('now'), datetime('now')),
  ('i18n-disease-002', 'master.disease_type.diabetes', 'master', '당뇨', 'Diabetes', '糖尿病', '糖尿病', '糖尿病', 1, datetime('now'), datetime('now')),
  ('i18n-disease-003', 'master.disease_device_type.glucose_meter', 'master', '당뇨검사기', 'Glucose Meter', '血糖測定器', '血糖仪', '血糖儀', 1, datetime('now'), datetime('now')),
  ('i18n-disease-004', 'master.disease_measurement_type.glucose_value', 'master', '혈당 수치', 'Glucose Value', '血糖値', '血糖值', '血糖值', 1, datetime('now'), datetime('now')),
  ('i18n-disease-005', 'master.disease_measurement_context.pre_meal', 'master', '식전', 'Pre Meal', '食前', '餐前', '餐前', 1, datetime('now'), datetime('now')),
  ('i18n-disease-006', 'master.disease_judgement_rule_type.normal', 'master', '정상', 'Normal', '正常', '正常', '正常', 1, datetime('now'), datetime('now')),
  ('i18n-disease-007', 'master.disease_judgement_rule_type.warning', 'master', '주의', 'Warning', '注意', '注意', '注意', 1, datetime('now'), datetime('now')),
  ('i18n-disease-008', 'master.disease_judgement_rule_type.danger', 'master', '위험', 'Danger', '危険', '危险', '危險', 1, datetime('now'), datetime('now')),
  ('i18n-disease-009', 'master.disease_judgement_rule_type.critical', 'master', '매우 위험', 'Critical', '重度危険', '极度危险', '極度危險', 1, datetime('now'), datetime('now')),
  ('i18n-disease-010', 'master.allergy_group.protein', 'master', '단백질', 'Protein', 'タンパク質', '蛋白质', '蛋白質', 1, datetime('now'), datetime('now')),
  ('i18n-disease-011', 'master.allergy_type.chicken', 'master', '닭고기', 'Chicken', '鶏肉', '鸡肉', '雞肉', 1, datetime('now'), datetime('now')),
  ('i18n-disease-012', 'master.diet_subtype.diabetes_prescription', 'master', '당뇨 처방식', 'Diabetes Prescription', '糖尿病処方食', '糖尿病处方粮', '糖尿病處方糧', 1, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0023_disease_management_foundation');
