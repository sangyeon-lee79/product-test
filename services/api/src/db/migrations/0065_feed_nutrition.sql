-- 0065: Feed nutrition — per feed-model nutritional information
CREATE TABLE IF NOT EXISTS feed_nutrition (
  id               TEXT PRIMARY KEY,
  feed_model_id    TEXT NOT NULL REFERENCES feed_models(id) ON DELETE CASCADE,
  calories_per_100g REAL,
  protein_pct      REAL,
  fat_pct          REAL,
  fiber_pct        REAL,
  moisture_pct     REAL,
  ash_pct          REAL,
  calcium_pct      REAL,
  phosphorus_pct   REAL,
  omega3_pct       REAL,
  omega6_pct       REAL,
  carbohydrate_pct REAL,
  serving_size_g   REAL,
  ingredients_text TEXT,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(feed_model_id)
);
