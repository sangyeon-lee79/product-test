-- 0044: Pet multi-select relation tables + generic health measurement logs

CREATE TABLE IF NOT EXISTS pet_allergies (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergy_item_id   TEXT NOT NULL REFERENCES master_items(id),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(pet_id, allergy_item_id)
);

CREATE TABLE IF NOT EXISTS pet_symptoms (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  symptom_item_id   TEXT NOT NULL REFERENCES master_items(id),
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(pet_id, symptom_item_id)
);

CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id                  TEXT PRIMARY KEY,
  pet_id              TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccination_item_id TEXT NOT NULL REFERENCES master_items(id),
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(pet_id, vaccination_item_id)
);

CREATE TABLE IF NOT EXISTS pet_health_measurement_logs (
  id                      TEXT PRIMARY KEY,
  pet_id                  TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id         TEXT NOT NULL REFERENCES master_items(id),
  device_type_item_id     TEXT REFERENCES master_items(id),
  device_model_id         TEXT,
  measurement_item_id     TEXT NOT NULL REFERENCES master_items(id),
  measurement_context_id  TEXT REFERENCES master_items(id),
  value                   REAL NOT NULL,
  unit_item_id            TEXT REFERENCES master_items(id),
  measured_at             TEXT NOT NULL,
  memo                    TEXT,
  recorded_by_user_id     TEXT NOT NULL REFERENCES users(id),
  judgement_level         TEXT,
  judgement_label         TEXT,
  created_at              TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pet_allergies_pet ON pet_allergies(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_symptoms_pet ON pet_symptoms(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet ON pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_hml_pet_measured ON pet_health_measurement_logs(pet_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_hml_measurement ON pet_health_measurement_logs(measurement_item_id, measured_at DESC);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0044_pet_health_multiselect_and_measurements');
