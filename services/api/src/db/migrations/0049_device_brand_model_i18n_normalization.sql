-- 0049_device_brand_model_i18n_normalization.sql
-- Normalize brand/model names to i18n-key + translations

ALTER TABLE device_brands ADD COLUMN name_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_brands_name_key ON device_brands(name_key);

ALTER TABLE device_models ADD COLUMN name_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_models_name_key ON device_models(name_key);

-- Backfill stable i18n keys
UPDATE device_brands
SET name_key = CASE
  WHEN name_key IS NOT NULL AND TRIM(name_key) <> '' THEN name_key
  ELSE ('device.brand.' || COALESCE(NULLIF(TRIM(id), ''), lower(hex(randomblob(8)))))
END
WHERE name_key IS NULL OR TRIM(name_key) = '';

UPDATE device_models
SET name_key = CASE
  WHEN name_key IS NOT NULL AND TRIM(name_key) <> '' THEN name_key
  ELSE ('device.model.' || COALESCE(NULLIF(TRIM(id), ''), lower(hex(randomblob(8)))))
END
WHERE name_key IS NULL OR TRIM(name_key) = '';

-- Ensure i18n rows for brands
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  b.name_key,
  'device',
  COALESCE(NULLIF(TRIM(b.name_ko), ''), NULLIF(TRIM(b.name_en), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  COALESCE(NULLIF(TRIM(b.name_en), ''), NULLIF(TRIM(b.name_ko), ''), b.id),
  1,
  datetime('now'),
  datetime('now')
FROM device_brands b
WHERE b.name_key IS NOT NULL AND TRIM(b.name_key) <> '';

-- Ensure i18n rows for models
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  m.name_key,
  'device',
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  COALESCE(NULLIF(TRIM(m.model_name), ''), m.id),
  1,
  datetime('now'),
  datetime('now')
FROM device_models m
WHERE m.name_key IS NOT NULL AND TRIM(m.name_key) <> '';

-- Fill missing locales from en/ko for all device.* keys
UPDATE i18n_translations
SET
  ko = COALESCE(NULLIF(TRIM(ko), ''), NULLIF(TRIM(en), ''), key),
  en = COALESCE(NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  ja = COALESCE(NULLIF(TRIM(ja), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  zh_cn = COALESCE(NULLIF(TRIM(zh_cn), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  zh_tw = COALESCE(NULLIF(TRIM(zh_tw), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  es = COALESCE(NULLIF(TRIM(es), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  fr = COALESCE(NULLIF(TRIM(fr), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  de = COALESCE(NULLIF(TRIM(de), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  pt = COALESCE(NULLIF(TRIM(pt), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  vi = COALESCE(NULLIF(TRIM(vi), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  th = COALESCE(NULLIF(TRIM(th), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  id_lang = COALESCE(NULLIF(TRIM(id_lang), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  ar = COALESCE(NULLIF(TRIM(ar), ''), NULLIF(TRIM(en), ''), NULLIF(TRIM(ko), ''), key),
  updated_at = datetime('now')
WHERE key LIKE 'device.brand.%'
   OR key LIKE 'device.model.%';
