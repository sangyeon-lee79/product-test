-- 0071_multi_feed_mixing.sql
-- Support mixed/multi-feed feeding logs.
-- A feeding log with is_mixed=1 stores individual feed items in pet_feeding_log_items.

CREATE TABLE IF NOT EXISTS pet_feeding_log_items (
  id              TEXT PRIMARY KEY,
  feeding_log_id  TEXT NOT NULL REFERENCES pet_feeding_logs(id) ON DELETE CASCADE,
  pet_feed_id     TEXT REFERENCES pet_feeds(id),
  feed_model_id   TEXT REFERENCES feed_models(id),
  amount_g        REAL,
  ratio_pct       REAL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feeding_log_items_log
  ON pet_feeding_log_items(feeding_log_id);

ALTER TABLE pet_feeding_logs ADD COLUMN is_mixed INTEGER DEFAULT 0;
