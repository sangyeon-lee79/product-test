-- 0044_device_management.sql
-- Device Management: device_types, device_manufacturers, device_brands, device_models
-- guardian_devices, measurement_units, measurement_ranges
-- L3 linkage: master_items.device_type_id

-- ─── device_types ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_types (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name_ko     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── device_manufacturers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_manufacturers (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name_ko     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  country     TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── device_brands ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_brands (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  name_ko          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── device_models ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_models (
  id               TEXT PRIMARY KEY,
  device_type_id   TEXT NOT NULL REFERENCES device_types(id),
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  brand_id         TEXT REFERENCES device_brands(id),
  model_name       TEXT NOT NULL,
  model_code       TEXT,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── guardian_devices ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guardian_devices (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  device_model_id  TEXT NOT NULL REFERENCES device_models(id),
  nickname         TEXT,
  serial_number    TEXT,
  start_date       TEXT,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_guardian_devices_pet ON guardian_devices(pet_id, status);

-- ─── measurement_units ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS measurement_units (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  symbol      TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── measurement_ranges ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS measurement_ranges (
  id                    TEXT PRIMARY KEY,
  measurement_item_id   TEXT NOT NULL REFERENCES master_items(id),
  species               TEXT,
  min_value             REAL,
  max_value             REAL,
  unit_id               TEXT NOT NULL REFERENCES measurement_units(id),
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── L3 linkage column ─────────────────────────────────────────────────────
ALTER TABLE master_items ADD COLUMN device_type_id TEXT REFERENCES device_types(id);

-- ─── Seed: device_types ────────────────────────────────────────────────────
INSERT OR IGNORE INTO device_types (id, key, name_ko, name_en, status, sort_order, created_at, updated_at) VALUES
  ('dt-glucose-meter',   'glucose_meter',               '혈당측정기',       'Blood Glucose Meter',          'active', 1, datetime('now'), datetime('now')),
  ('dt-cgm',             'continuous_glucose_monitor',  '연속혈당측정기',   'Continuous Glucose Monitor',   'active', 2, datetime('now'), datetime('now')),
  ('dt-insulin-pen',     'insulin_pen',                 '인슐린 펜',        'Insulin Pen',                  'active', 3, datetime('now'), datetime('now')),
  ('dt-pet-scale',       'pet_scale',                   '반려동물 체중계',  'Pet Scale',                    'active', 4, datetime('now'), datetime('now')),
  ('dt-heart-rate',      'heart_rate_monitor',          '심박수 모니터',    'Heart Rate Monitor',           'active', 5, datetime('now'), datetime('now'));

-- ─── Seed: device_manufacturers ────────────────────────────────────────────
INSERT OR IGNORE INTO device_manufacturers (id, key, name_ko, name_en, country, status, sort_order, created_at, updated_at) VALUES
  ('dm-abbott',    'abbott',   'Abbott',    'Abbott',    'US', 'active', 1, datetime('now'), datetime('now')),
  ('dm-roche',     'roche',    'Roche',     'Roche',     'CH', 'active', 2, datetime('now'), datetime('now')),
  ('dm-lifescan',  'lifescan', 'LifeScan',  'LifeScan',  'US', 'active', 3, datetime('now'), datetime('now')),
  ('dm-omron',     'omron',    'Omron',     'Omron',     'JP', 'active', 4, datetime('now'), datetime('now'));

-- ─── Seed: device_brands ───────────────────────────────────────────────────
INSERT OR IGNORE INTO device_brands (id, manufacturer_id, name_ko, name_en, status, created_at, updated_at) VALUES
  ('db-freestyle',  'dm-abbott',   'FreeStyle',  'FreeStyle',  'active', datetime('now'), datetime('now')),
  ('db-accu-chek',  'dm-roche',    'Accu-Chek',  'Accu-Chek',  'active', datetime('now'), datetime('now')),
  ('db-onetouch',   'dm-lifescan', 'OneTouch',   'OneTouch',   'active', datetime('now'), datetime('now')),
  ('db-omron',      'dm-omron',    'Omron',      'Omron',      'active', datetime('now'), datetime('now'));

-- ─── Seed: device_models ───────────────────────────────────────────────────
INSERT OR IGNORE INTO device_models (id, device_type_id, manufacturer_id, brand_id, model_name, model_code, description, status, created_at, updated_at) VALUES
  ('mod-libre2',          'dt-cgm',           'dm-abbott',   'db-freestyle', 'FreeStyle Libre 2',      'FSL2',    'Abbott FreeStyle Libre 2 CGM',          'active', datetime('now'), datetime('now')),
  ('mod-libre3',          'dt-cgm',           'dm-abbott',   'db-freestyle', 'FreeStyle Libre 3',      'FSL3',    'Abbott FreeStyle Libre 3 CGM',          'active', datetime('now'), datetime('now')),
  ('mod-accuchek-guide',  'dt-glucose-meter', 'dm-roche',    'db-accu-chek', 'Accu-Chek Guide',        'ACG',     'Roche Accu-Chek Guide blood glucose meter', 'active', datetime('now'), datetime('now')),
  ('mod-accuchek-active', 'dt-glucose-meter', 'dm-roche',    'db-accu-chek', 'Accu-Chek Active',       'ACA',     'Roche Accu-Chek Active blood glucose meter', 'active', datetime('now'), datetime('now')),
  ('mod-onetouch-ultra',  'dt-glucose-meter', 'dm-lifescan', 'db-onetouch',  'OneTouch Ultra',         'OTU',     'LifeScan OneTouch Ultra blood glucose meter', 'active', datetime('now'), datetime('now')),
  ('mod-onetouch-select', 'dt-glucose-meter', 'dm-lifescan', 'db-onetouch',  'OneTouch Select Plus',   'OTSP',    'LifeScan OneTouch Select Plus blood glucose meter', 'active', datetime('now'), datetime('now'));

-- ─── Backfill master_items.device_type_id for existing L3 items ────────────
UPDATE master_items
SET device_type_id = 'dt-glucose-meter'
WHERE (key = 'glucose_meter' OR key LIKE '%glucose_meter%')
  AND device_type_id IS NULL;

UPDATE master_items
SET device_type_id = 'dt-cgm'
WHERE (key = 'continuous_glucose_monitor' OR key LIKE '%cgm%' OR key LIKE '%continuous_glucose%')
  AND device_type_id IS NULL;

UPDATE master_items
SET device_type_id = 'dt-insulin-pen'
WHERE (key = 'insulin_pen' OR key LIKE '%insulin_pen%')
  AND device_type_id IS NULL;

-- ─── Seed: measurement_units ───────────────────────────────────────────────
INSERT OR IGNORE INTO measurement_units (id, key, name, symbol, status, sort_order, created_at, updated_at) VALUES
  ('mu-mg-dl',    'mg_dl',    'Milligrams per deciliter', 'mg/dL',  'active', 1,  datetime('now'), datetime('now')),
  ('mu-mmol-l',   'mmol_l',   'Millimoles per liter',     'mmol/L', 'active', 2,  datetime('now'), datetime('now')),
  ('mu-kg',       'kg',       'Kilogram',                 'kg',     'active', 3,  datetime('now'), datetime('now')),
  ('mu-g',        'g',        'Gram',                     'g',      'active', 4,  datetime('now'), datetime('now')),
  ('mu-bpm',      'bpm',      'Beats per minute',         'bpm',    'active', 5,  datetime('now'), datetime('now')),
  ('mu-celsius',  'celsius',  'Celsius',                  '°C',     'active', 6,  datetime('now'), datetime('now')),
  ('mu-percent',  'percent',  'Percent',                  '%',      'active', 7,  datetime('now'), datetime('now')),
  ('mu-iu',       'iu',       'International Unit',       'IU',     'active', 8,  datetime('now'), datetime('now')),
  ('mu-ml',       'ml',       'Milliliter',               'ml',     'active', 9,  datetime('now'), datetime('now')),
  ('mu-kcal',     'kcal',     'Kilocalorie',              'kcal',   'active', 10, datetime('now'), datetime('now')),
  ('mu-min',      'min',      'Minute',                   'min',    'active', 11, datetime('now'), datetime('now'));
