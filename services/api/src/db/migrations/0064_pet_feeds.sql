-- 0064: Pet feeds — per-pet feed registration (mirrors guardian_devices pattern)
CREATE TABLE IF NOT EXISTS pet_feeds (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  feed_model_id    TEXT NOT NULL REFERENCES feed_models(id),
  disease_item_id  TEXT REFERENCES master_items(id),
  nickname         TEXT,
  daily_amount_g   REAL,
  daily_amount_unit TEXT DEFAULT 'g',
  feeding_frequency INTEGER,
  start_date       TEXT,
  end_date         TEXT,
  notes            TEXT,
  is_primary       INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
