-- 0068: Pet Feeding Logs — 급여 기록 테이블
CREATE TABLE IF NOT EXISTS pet_feeding_logs (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  pet_feed_id      TEXT REFERENCES pet_feeds(id),
  feed_model_id    TEXT REFERENCES feed_models(id),
  amount_g         REAL,
  amount_unit      TEXT DEFAULT 'g',
  frequency        INTEGER,
  feeding_time     TEXT,
  memo             TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pet_feeding_logs_pet ON pet_feeding_logs(pet_id, status);
