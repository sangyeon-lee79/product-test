-- 0056_device_feed_multi_parent_maps.sql
-- Multi-parent mappings for device/feed catalog hierarchy

-- Device hierarchy maps
CREATE TABLE IF NOT EXISTS device_manufacturer_type_map (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  type_item_id     TEXT NOT NULL REFERENCES master_items(id),
  created_at       TEXT NOT NULL,
  UNIQUE(manufacturer_id, type_item_id)
);

CREATE TABLE IF NOT EXISTS device_brand_manufacturer_map (
  id               TEXT PRIMARY KEY,
  brand_id         TEXT NOT NULL REFERENCES device_brands(id),
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  created_at       TEXT NOT NULL,
  UNIQUE(brand_id, manufacturer_id)
);

CREATE TABLE IF NOT EXISTS device_model_brand_map (
  id         TEXT PRIMARY KEY,
  model_id   TEXT NOT NULL REFERENCES device_models(id),
  brand_id   TEXT NOT NULL REFERENCES device_brands(id),
  created_at TEXT NOT NULL,
  UNIQUE(model_id, brand_id)
);

-- Feed hierarchy maps
CREATE TABLE IF NOT EXISTS feed_manufacturer_type_map (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES feed_manufacturers(id),
  type_item_id     TEXT NOT NULL REFERENCES master_items(id),
  created_at       TEXT NOT NULL,
  UNIQUE(manufacturer_id, type_item_id)
);

CREATE TABLE IF NOT EXISTS feed_brand_manufacturer_map (
  id               TEXT PRIMARY KEY,
  brand_id         TEXT NOT NULL REFERENCES feed_brands(id),
  manufacturer_id  TEXT NOT NULL REFERENCES feed_manufacturers(id),
  created_at       TEXT NOT NULL,
  UNIQUE(brand_id, manufacturer_id)
);

CREATE TABLE IF NOT EXISTS feed_model_brand_map (
  id         TEXT PRIMARY KEY,
  model_id   TEXT NOT NULL REFERENCES feed_models(id),
  brand_id   TEXT NOT NULL REFERENCES feed_brands(id),
  created_at TEXT NOT NULL,
  UNIQUE(model_id, brand_id)
);

-- Backfill from existing single-parent columns
INSERT OR IGNORE INTO device_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
SELECT lower(hex(randomblob(16))), m.manufacturer_id, m.device_type_item_id, datetime('now')
FROM device_models m
WHERE m.manufacturer_id IS NOT NULL
  AND m.device_type_item_id IS NOT NULL;

INSERT OR IGNORE INTO device_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
SELECT lower(hex(randomblob(16))), b.id, b.manufacturer_id, datetime('now')
FROM device_brands b
WHERE b.manufacturer_id IS NOT NULL;

INSERT OR IGNORE INTO device_model_brand_map (id, model_id, brand_id, created_at)
SELECT lower(hex(randomblob(16))), m.id, m.brand_id, datetime('now')
FROM device_models m
WHERE m.brand_id IS NOT NULL;

INSERT OR IGNORE INTO feed_manufacturer_type_map (id, manufacturer_id, type_item_id, created_at)
SELECT lower(hex(randomblob(16))), m.manufacturer_id, m.feed_type_item_id, datetime('now')
FROM feed_models m
WHERE m.manufacturer_id IS NOT NULL
  AND m.feed_type_item_id IS NOT NULL;

INSERT OR IGNORE INTO feed_brand_manufacturer_map (id, brand_id, manufacturer_id, created_at)
SELECT lower(hex(randomblob(16))), b.id, b.manufacturer_id, datetime('now')
FROM feed_brands b
WHERE b.manufacturer_id IS NOT NULL;

INSERT OR IGNORE INTO feed_model_brand_map (id, model_id, brand_id, created_at)
SELECT lower(hex(randomblob(16))), m.id, m.brand_id, datetime('now')
FROM feed_models m
WHERE m.brand_id IS NOT NULL;
