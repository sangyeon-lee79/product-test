-- S1 보강: Google Cloud Translation 캐시/쿼터 테이블

CREATE TABLE IF NOT EXISTS translation_memory (
  id TEXT PRIMARY KEY,
  source_ko TEXT NOT NULL UNIQUE,
  en TEXT,
  ja TEXT,
  zh_cn TEXT,
  zh_tw TEXT,
  es TEXT,
  fr TEXT,
  de TEXT,
  pt TEXT,
  vi TEXT,
  th TEXT,
  id_lang TEXT,
  ar TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL,
  use_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_translation_memory_source_ko
  ON translation_memory(source_ko);

CREATE TABLE IF NOT EXISTS translation_quota_usage (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  char_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
