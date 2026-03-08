-- 0052_feed_catalog_management.sql
-- Feed catalog management (admin)
-- feed type is linked to master L3: diet_feed_type

CREATE TABLE IF NOT EXISTS feed_manufacturers (
  id             TEXT PRIMARY KEY,
  key            TEXT UNIQUE NOT NULL,
  name_key       TEXT UNIQUE,
  name_ko        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  country        TEXT,
  status         TEXT NOT NULL DEFAULT 'active',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_brands (
  id              TEXT PRIMARY KEY,
  manufacturer_id TEXT NOT NULL REFERENCES feed_manufacturers(id),
  name_key        TEXT UNIQUE,
  name_ko         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_models (
  id                 TEXT PRIMARY KEY,
  feed_type_item_id  TEXT NOT NULL REFERENCES master_items(id),
  manufacturer_id    TEXT NOT NULL REFERENCES feed_manufacturers(id),
  brand_id           TEXT REFERENCES feed_brands(id),
  name_key           TEXT UNIQUE,
  model_name         TEXT NOT NULL,
  model_code         TEXT,
  description        TEXT,
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feed_models_type_item ON feed_models(feed_type_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_models_mfr ON feed_models(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_feed_models_brand ON feed_models(brand_id);
