-- 혼합급여 즐겨찾기 테이블
CREATE TABLE IF NOT EXISTS feeding_mix_favorites (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fmf_pet ON feeding_mix_favorites(pet_id, status);
