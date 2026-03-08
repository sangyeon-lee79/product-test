-- 0054_seed_countries_kr_us_vn_jp.sql
-- Seed admin countries/currencies with i18n-ready keys

-- 1) Currencies
INSERT OR IGNORE INTO currencies (id, code, symbol, name_key, decimal_places, is_active, created_at) VALUES
  ('cur-krw', 'KRW', '₩', 'currency.krw', 0, 1, datetime('now')),
  ('cur-usd', 'USD', '$', 'currency.usd', 2, 1, datetime('now')),
  ('cur-vnd', 'VND', '₫', 'currency.vnd', 0, 1, datetime('now')),
  ('cur-jpy', 'JPY', '¥', 'currency.jpy', 0, 1, datetime('now'));

UPDATE currencies
SET is_active = 1
WHERE code IN ('KRW', 'USD', 'VND', 'JPY');

-- 2) Countries
INSERT OR IGNORE INTO countries (id, code, name_key, is_active, sort_order, created_at) VALUES
  ('country-kr', 'KR', 'country.kr', 1, 10, datetime('now')),
  ('country-us', 'US', 'country.us', 1, 20, datetime('now')),
  ('country-vn', 'VN', 'country.vn', 1, 30, datetime('now')),
  ('country-jp', 'JP', 'country.jp', 1, 40, datetime('now'));

UPDATE countries
SET is_active = 1
WHERE code IN ('KR', 'US', 'VN', 'JP');

-- 3) Default country-currency mapping
INSERT OR IGNORE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-kr-krw', c.id, cur.id, 1
FROM countries c
JOIN currencies cur ON cur.code = 'KRW'
WHERE c.code = 'KR';

INSERT OR IGNORE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-us-usd', c.id, cur.id, 1
FROM countries c
JOIN currencies cur ON cur.code = 'USD'
WHERE c.code = 'US';

INSERT OR IGNORE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-vn-vnd', c.id, cur.id, 1
FROM countries c
JOIN currencies cur ON cur.code = 'VND'
WHERE c.code = 'VN';

INSERT OR IGNORE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-jp-jpy', c.id, cur.id, 1
FROM countries c
JOIN currencies cur ON cur.code = 'JPY'
WHERE c.code = 'JP';

-- Ensure each mapping above is default
UPDATE country_currency_map
SET is_default = 1
WHERE id IN ('ccm-kr-krw', 'ccm-us-usd', 'ccm-vn-vnd', 'ccm-jp-jpy');

-- 4) i18n translations for country/currency keys
WITH t(key, page, ko, en) AS (
  VALUES
    ('country.kr', 'country', '대한민국', 'Korea'),
    ('country.us', 'country', '미국', 'United States'),
    ('country.vn', 'country', '베트남', 'Vietnam'),
    ('country.jp', 'country', '일본', 'Japan'),
    ('currency.krw', 'country', '원', 'Korean Won'),
    ('currency.usd', 'country', '달러', 'US Dollar'),
    ('currency.vnd', 'country', '동', 'Vietnamese Dong'),
    ('currency.jpy', 'country', '엔', 'Japanese Yen')
)
INSERT OR IGNORE INTO i18n_translations (
  id, key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar, is_active, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  t.key,
  t.page,
  t.ko,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en) AS (
  VALUES
    ('country.kr', '대한민국', 'Korea'),
    ('country.us', '미국', 'United States'),
    ('country.vn', '베트남', 'Vietnam'),
    ('country.jp', '일본', 'Japan'),
    ('currency.krw', '원', 'Korean Won'),
    ('currency.usd', '달러', 'US Dollar'),
    ('currency.vnd', '동', 'Vietnamese Dong'),
    ('currency.jpy', '엔', 'Japanese Yen')
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
  ja = COALESCE(NULLIF(ja, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  zh_cn = COALESCE(NULLIF(zh_cn, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  zh_tw = COALESCE(NULLIF(zh_tw, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  es = COALESCE(NULLIF(es, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  fr = COALESCE(NULLIF(fr, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  de = COALESCE(NULLIF(de, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  pt = COALESCE(NULLIF(pt, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  vi = COALESCE(NULLIF(vi, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  th = COALESCE(NULLIF(th, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  id_lang = COALESCE(NULLIF(id_lang, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  ar = COALESCE(NULLIF(ar, ''), (SELECT x.en FROM t x WHERE x.key = i18n_translations.key)),
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);
