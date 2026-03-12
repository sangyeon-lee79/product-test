-- 088: Grooming records for service completion + guardian approval flow
-- Status workflow: pending_guardian → approved | published

CREATE TABLE IF NOT EXISTS grooming_records (
  id                TEXT PRIMARY KEY,
  appointment_id    TEXT REFERENCES appointments(id),
  pet_id            TEXT REFERENCES pets(id),
  supplier_id       TEXT NOT NULL REFERENCES users(id),
  guardian_id        TEXT NOT NULL REFERENCES users(id),
  grooming_type     TEXT,
  cut_style         TEXT,
  duration_minutes  INTEGER,
  products_used     TEXT,
  special_notes     TEXT,
  supplier_comment  TEXT,
  photos            JSONB NOT NULL DEFAULT '[]',
  status            TEXT NOT NULL DEFAULT 'pending_guardian',
  guardian_choice   TEXT,
  post_id           TEXT REFERENCES feed_posts(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_grooming_records_appointment ON grooming_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_grooming_records_pet         ON grooming_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_grooming_records_supplier     ON grooming_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_grooming_records_guardian     ON grooming_records(guardian_id);
CREATE INDEX IF NOT EXISTS idx_grooming_records_status       ON grooming_records(status);
