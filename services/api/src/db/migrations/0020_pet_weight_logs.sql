-- Migration 0020: Birthday + current weight cache + weight time-series logs

ALTER TABLE pets ADD COLUMN birthday TEXT; -- YYYY-MM-DD
ALTER TABLE pets ADD COLUMN current_weight REAL;

-- Backfill from legacy columns
UPDATE pets
SET birthday = COALESCE(birthday, birth_date),
    current_weight = COALESCE(current_weight, weight_kg)
WHERE 1=1;

CREATE TABLE IF NOT EXISTS pet_weight_logs (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_value REAL NOT NULL,
  weight_unit_id TEXT REFERENCES master_items(id),
  measured_at TEXT NOT NULL, -- ISO datetime
  recorded_by_user_id TEXT NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pet_weight_logs_pet_measured ON pet_weight_logs(pet_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_weight_logs_recorded_by ON pet_weight_logs(recorded_by_user_id, created_at DESC);

-- Backfill one log from existing current/legacy weight if present
INSERT OR IGNORE INTO pet_weight_logs (
  id,
  pet_id,
  weight_value,
  weight_unit_id,
  measured_at,
  recorded_by_user_id,
  notes,
  created_at,
  updated_at
)
SELECT
  lower(hex(randomblob(16))),
  p.id,
  COALESCE(p.current_weight, p.weight_kg),
  p.weight_unit_id,
  COALESCE(p.updated_at, p.created_at, datetime('now')),
  p.guardian_id,
  'Initial backfill from pets current weight',
  COALESCE(p.created_at, datetime('now')),
  COALESCE(p.updated_at, datetime('now'))
FROM pets p
WHERE COALESCE(p.current_weight, p.weight_kg) IS NOT NULL
  AND p.status != 'deleted';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0020_pet_weight_logs');
