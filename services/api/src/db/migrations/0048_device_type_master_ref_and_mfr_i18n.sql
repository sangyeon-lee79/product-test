-- 0048_device_type_master_ref_and_mfr_i18n.sql
-- Device management normalization:
-- 1) device_models stores L3 master reference (device_type_item_id)
-- 2) device_manufacturers uses i18n key (name_key) for locale-aware label rendering

ALTER TABLE device_manufacturers ADD COLUMN name_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_manufacturers_name_key ON device_manufacturers(name_key);

ALTER TABLE device_models ADD COLUMN device_type_item_id TEXT REFERENCES master_items(id);
CREATE INDEX IF NOT EXISTS idx_device_models_type_item ON device_models(device_type_item_id);

-- Backfill manufacturer i18n key (stable key; new creates use random mfr_* key in API)
UPDATE device_manufacturers
SET name_key = CASE
  WHEN name_key IS NOT NULL AND TRIM(name_key) <> '' THEN name_key
  WHEN key IS NOT NULL AND TRIM(key) <> '' THEN ('device.manufacturer.' || key)
  ELSE ('device.manufacturer.mfr_' || lower(hex(randomblob(8))))
END
WHERE name_key IS NULL OR TRIM(name_key) = '';

-- Ensure translation rows exist for manufacturer labels
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  m.name_key,
  'device',
  m.name_ko,
  m.name_en,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  1,
  datetime('now'),
  datetime('now')
FROM device_manufacturers m
WHERE m.name_key IS NOT NULL AND TRIM(m.name_key) <> '';

-- Keep ko/en in sync for existing rows
UPDATE i18n_translations
SET
  ko = COALESCE(NULLIF(TRIM(ko), ''), (SELECT dm.name_ko FROM device_manufacturers dm WHERE dm.name_key = i18n_translations.key)),
  en = COALESCE(NULLIF(TRIM(en), ''), (SELECT dm.name_en FROM device_manufacturers dm WHERE dm.name_key = i18n_translations.key)),
  updated_at = datetime('now')
WHERE key IN (
  SELECT name_key
  FROM device_manufacturers
  WHERE name_key IS NOT NULL AND TRIM(name_key) <> ''
);

-- Backfill model -> L3 master item reference via legacy mapped device_type_id
UPDATE device_models
SET device_type_item_id = (
  SELECT mi.id
  FROM master_items mi
  WHERE mi.device_type_id = device_models.device_type_id
  ORDER BY mi.sort_order, mi.created_at
  LIMIT 1
)
WHERE device_type_item_id IS NULL AND device_type_id IS NOT NULL;
