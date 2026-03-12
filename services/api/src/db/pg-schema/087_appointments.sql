-- 087: Appointments table for grooming/service booking flow
-- Status workflow: pending → confirmed → rejected → completed

CREATE TABLE IF NOT EXISTS appointments (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT REFERENCES pets(id),
  guardian_id       TEXT NOT NULL REFERENCES users(id),
  supplier_id       TEXT NOT NULL REFERENCES users(id),
  store_id          TEXT REFERENCES stores(id),
  service_id        TEXT,
  service_type      TEXT NOT NULL DEFAULT '',
  scheduled_at      TIMESTAMPTZ,
  duration_minutes  INTEGER,
  price             INTEGER,
  request_note      TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  rejected_reason   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_guardian  ON appointments(guardian_id);
CREATE INDEX IF NOT EXISTS idx_appointments_supplier  ON appointments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status    ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_pet       ON appointments(pet_id);
