-- 0046_logs_core.sql
-- S7: 건강 기록 핵심 테이블 + log_type 마스터 시드
-- logs, log_values, log_media

-- ─── log_type 마스터 카테고리 ─────────────────────────────────────────────────
INSERT OR IGNORE INTO master_categories (id, code, sort_order, status, created_at, updated_at) VALUES
  ('mc-log-type', 'log_type', 200, 'active', datetime('now'), datetime('now'));

-- ─── log_type 시드 아이템 ────────────────────────────────────────────────────
INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at) VALUES
  ('mi-lt-blood-glucose', (SELECT id FROM master_categories WHERE code='log_type'), NULL, 'blood_glucose_log', 1, 'active', '{"value_type":"number","metric_code":"blood_glucose","unit_codes":["mg_dl","mmol_l"]}', datetime('now'), datetime('now')),
  ('mi-lt-insulin',       (SELECT id FROM master_categories WHERE code='log_type'), NULL, 'insulin_log',       2, 'active', '{"value_type":"number","metric_code":"insulin_dose","unit_codes":["iu"]}',           datetime('now'), datetime('now')),
  ('mi-lt-meal',          (SELECT id FROM master_categories WHERE code='log_type'), NULL, 'meal_log',          3, 'active', '{"value_type":"number","metric_code":"meal_amount","unit_codes":["g","ml","kcal"]}',  datetime('now'), datetime('now')),
  ('mi-lt-weight',        (SELECT id FROM master_categories WHERE code='log_type'), NULL, 'weight_log',        4, 'active', '{"value_type":"number","metric_code":"body_weight","unit_codes":["kg","g"]}',         datetime('now'), datetime('now')),
  ('mi-lt-general',       (SELECT id FROM master_categories WHERE code='log_type'), NULL, 'general_note',      5, 'active', '{"value_type":"text"}',                                                               datetime('now'), datetime('now'));

-- ─── i18n: log_type 라벨 (13개 언어) ─────────────────────────────────────────
INSERT OR IGNORE INTO i18n_translations
  (id, key, namespace, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_verified, created_at, updated_at)
VALUES
  ('i46-lt-blood-glucose', 'master.log_type.blood_glucose_log', 'master',
   '혈당 기록', 'Blood Glucose Log', '血糖記録', '血糖记录', '血糖記錄', 'Registro de glucosa', 'Journal glycémique', 'Blutzuckerprotokoll', 'Registro de glicemia', 'Nhật ký đường huyết', 'บันทึกน้ำตาลในเลือด', 'Log glukosa darah', 'سجل سكر الدم',
   1, datetime('now'), datetime('now')),
  ('i46-lt-insulin', 'master.log_type.insulin_log', 'master',
   '인슐린 기록', 'Insulin Log', 'インスリン記録', '胰岛素记录', '胰島素記錄', 'Registro de insulina', "Journal d'insuline", 'Insulinprotokoll', 'Registro de insulina', 'Nhật ký insulin', 'บันทึกอินซูลิน', 'Log insulin', 'سجل الأنسولين',
   1, datetime('now'), datetime('now')),
  ('i46-lt-meal', 'master.log_type.meal_log', 'master',
   '식사 기록', 'Meal Log', '食事記録', '饮食记录', '飲食記錄', 'Registro de comida', 'Journal alimentaire', 'Mahlzeitenprotokoll', 'Registro de refeição', 'Nhật ký bữa ăn', 'บันทึกมื้ออาหาร', 'Log makan', 'سجل الوجبات',
   1, datetime('now'), datetime('now')),
  ('i46-lt-weight', 'master.log_type.weight_log', 'master',
   '체중 기록', 'Weight Log', '体重記録', '体重记录', '體重記錄', 'Registro de peso', 'Journal de poids', 'Gewichtsprotokoll', 'Registro de peso', 'Nhật ký cân nặng', 'บันทึกน้ำหนัก', 'Log berat badan', 'سجل الوزن',
   1, datetime('now'), datetime('now')),
  ('i46-lt-general', 'master.log_type.general_note', 'master',
   '일반 메모', 'General Note', '一般メモ', '一般备注', '一般備注', 'Nota general', 'Note générale', 'Allgemeine Notiz', 'Nota geral', 'Ghi chú chung', 'บันทึกทั่วไป', 'Catatan umum', 'ملاحظة عامة',
   1, datetime('now'), datetime('now'));

-- ─── logs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs (
  id            TEXT PRIMARY KEY,
  pet_id        TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  author_id     TEXT NOT NULL,
  logtype_id    TEXT NOT NULL REFERENCES master_items(id),
  event_date    TEXT NOT NULL,
  event_time    TEXT,
  title         TEXT,
  notes         TEXT,
  metadata      TEXT NOT NULL DEFAULT '{}',
  is_synced     INTEGER NOT NULL DEFAULT 1,
  sync_version  INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_logs_pet_date     ON logs(pet_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_logs_pet_logtype  ON logs(pet_id, logtype_id);
CREATE INDEX IF NOT EXISTS idx_logs_author       ON logs(author_id);

-- ─── log_values ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS log_values (
  id             TEXT PRIMARY KEY,
  log_id         TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  metric_id      TEXT NOT NULL REFERENCES master_items(id),
  unit_id        TEXT NOT NULL REFERENCES master_items(id),
  numeric_value  REAL,
  text_value     TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_log_values_log ON log_values(log_id);

-- ─── log_media ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS log_media (
  id             TEXT PRIMARY KEY,
  log_id         TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  media_url      TEXT NOT NULL,
  media_type     TEXT NOT NULL DEFAULT 'image',
  thumbnail_url  TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_log_media_log ON log_media(log_id);
