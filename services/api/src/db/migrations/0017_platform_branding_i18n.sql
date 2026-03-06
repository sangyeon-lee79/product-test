-- Migration 0017: Platform branding (Petfolio)

INSERT INTO i18n_translations (
  id, key, page,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar,
  is_active, created_at, updated_at
)
VALUES
  (
    lower(hex(randomblob(16))),
    'platform.name',
    'platform',
    '펫폴리오',
    'Petfolio',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    1,
    datetime('now'),
    datetime('now')
  ),
  (
    lower(hex(randomblob(16))),
    'platform.tagline',
    'platform',
    '반려동물의 삶을 기록하는 포트폴리오 플랫폼',
    "Your pet's life portfolio",
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    1,
    datetime('now'),
    datetime('now')
  )
ON CONFLICT(key) DO UPDATE SET
  page = excluded.page,
  ko = excluded.ko,
  en = excluded.en,
  is_active = 1,
  updated_at = excluded.updated_at;

-- Keep existing admin app name aligned with platform branding.
UPDATE i18n_translations
SET ko = '펫폴리오',
    en = 'Petfolio',
    updated_at = datetime('now')
WHERE key = 'admin.login.app_name';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0017_platform_branding_i18n');
