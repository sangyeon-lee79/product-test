-- 0055_seed_countries_full_13_localized.sql
-- Expand countries/currencies to 13-locale aligned set with localized country translations.

-- 1) Currencies (upsert-like: insert missing + activate existing)
INSERT OR IGNORE INTO currencies (id, code, symbol, name_key, decimal_places, is_active, created_at) VALUES
  ('cur-krw', 'KRW', '₩', 'currency.krw', 0, 1, datetime('now')),
  ('cur-usd', 'USD', '$', 'currency.usd', 2, 1, datetime('now')),
  ('cur-jpy', 'JPY', '¥', 'currency.jpy', 0, 1, datetime('now')),
  ('cur-cny', 'CNY', '¥', 'currency.cny', 2, 1, datetime('now')),
  ('cur-twd', 'TWD', 'NT$', 'currency.twd', 2, 1, datetime('now')),
  ('cur-eur', 'EUR', '€', 'currency.eur', 2, 1, datetime('now')),
  ('cur-vnd', 'VND', '₫', 'currency.vnd', 0, 1, datetime('now')),
  ('cur-thb', 'THB', '฿', 'currency.thb', 2, 1, datetime('now')),
  ('cur-idr', 'IDR', 'Rp', 'currency.idr', 0, 1, datetime('now')),
  ('cur-sar', 'SAR', '﷼', 'currency.sar', 2, 1, datetime('now'));

UPDATE currencies
SET is_active = 1
WHERE code IN ('KRW', 'USD', 'JPY', 'CNY', 'TWD', 'EUR', 'VND', 'THB', 'IDR', 'SAR');

-- 2) Countries (13 target countries)
INSERT OR IGNORE INTO countries (id, code, name_key, is_active, sort_order, created_at) VALUES
  ('country-kr', 'KR', 'country.kr', 1, 10, datetime('now')),
  ('country-us', 'US', 'country.us', 1, 20, datetime('now')),
  ('country-jp', 'JP', 'country.jp', 1, 30, datetime('now')),
  ('country-cn', 'CN', 'country.cn', 1, 40, datetime('now')),
  ('country-tw', 'TW', 'country.tw', 1, 50, datetime('now')),
  ('country-es', 'ES', 'country.es', 1, 60, datetime('now')),
  ('country-fr', 'FR', 'country.fr', 1, 70, datetime('now')),
  ('country-de', 'DE', 'country.de', 1, 80, datetime('now')),
  ('country-pt', 'PT', 'country.pt', 1, 90, datetime('now')),
  ('country-vn', 'VN', 'country.vn', 1, 100, datetime('now')),
  ('country-th', 'TH', 'country.th', 1, 110, datetime('now')),
  ('country-id', 'ID', 'country.id', 1, 120, datetime('now')),
  ('country-sa', 'SA', 'country.sa', 1, 130, datetime('now'));

UPDATE countries
SET is_active = 1
WHERE code IN ('KR', 'US', 'JP', 'CN', 'TW', 'ES', 'FR', 'DE', 'PT', 'VN', 'TH', 'ID', 'SA');

-- 3) Default country-currency mapping (ensure one default for target countries)
UPDATE country_currency_map
SET is_default = 0
WHERE country_id IN (
  SELECT id FROM countries WHERE code IN ('KR', 'US', 'JP', 'CN', 'TW', 'ES', 'FR', 'DE', 'PT', 'VN', 'TH', 'ID', 'SA')
);

INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-kr-krw', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'KRW' WHERE c.code = 'KR';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-us-usd', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'USD' WHERE c.code = 'US';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-jp-jpy', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'JPY' WHERE c.code = 'JP';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-cn-cny', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'CNY' WHERE c.code = 'CN';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-tw-twd', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'TWD' WHERE c.code = 'TW';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-es-eur', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'EUR' WHERE c.code = 'ES';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-fr-eur', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'EUR' WHERE c.code = 'FR';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-de-eur', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'EUR' WHERE c.code = 'DE';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-pt-eur', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'EUR' WHERE c.code = 'PT';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-vn-vnd', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'VND' WHERE c.code = 'VN';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-th-thb', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'THB' WHERE c.code = 'TH';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-id-idr', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'IDR' WHERE c.code = 'ID';
INSERT OR REPLACE INTO country_currency_map (id, country_id, currency_id, is_default)
SELECT 'ccm-sa-sar', c.id, cur.id, 1 FROM countries c JOIN currencies cur ON cur.code = 'SAR' WHERE c.code = 'SA';

-- 4) Country i18n (13 languages explicitly localized)
WITH t(key, page, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar) AS (
  VALUES
    ('country.kr', 'country', '대한민국', 'South Korea', '韓国', '韩国', '韓國', 'Corea del Sur', 'Corée du Sud', 'Südkorea', 'Coreia do Sul', 'Hàn Quốc', 'เกาหลีใต้', 'Korea Selatan', 'كوريا الجنوبية'),
    ('country.us', 'country', '미국', 'United States', 'アメリカ合衆国', '美国', '美國', 'Estados Unidos', 'États-Unis', 'Vereinigte Staaten', 'Estados Unidos', 'Hoa Kỳ', 'สหรัฐอเมริกา', 'Amerika Serikat', 'الولايات المتحدة'),
    ('country.jp', 'country', '일본', 'Japan', '日本', '日本', '日本', 'Japón', 'Japon', 'Japan', 'Japão', 'Nhật Bản', 'ญี่ปุ่น', 'Jepang', 'اليابان'),
    ('country.cn', 'country', '중국', 'China', '中国', '中国', '中國', 'China', 'Chine', 'China', 'China', 'Trung Quốc', 'จีน', 'Tiongkok', 'الصين'),
    ('country.tw', 'country', '대만', 'Taiwan', '台湾', '台湾', '台灣', 'Taiwán', 'Taïwan', 'Taiwan', 'Taiwan', 'Đài Loan', 'ไต้หวัน', 'Taiwan', 'تايوان'),
    ('country.es', 'country', '스페인', 'Spain', 'スペイン', '西班牙', '西班牙', 'España', 'Espagne', 'Spanien', 'Espanha', 'Tây Ban Nha', 'สเปน', 'Spanyol', 'إسبانيا'),
    ('country.fr', 'country', '프랑스', 'France', 'フランス', '法国', '法國', 'Francia', 'France', 'Frankreich', 'França', 'Pháp', 'ฝรั่งเศส', 'Prancis', 'فرنسا'),
    ('country.de', 'country', '독일', 'Germany', 'ドイツ', '德国', '德國', 'Alemania', 'Allemagne', 'Deutschland', 'Alemanha', 'Đức', 'เยอรมนี', 'Jerman', 'ألمانيا'),
    ('country.pt', 'country', '포르투갈', 'Portugal', 'ポルトガル', '葡萄牙', '葡萄牙', 'Portugal', 'Portugal', 'Portugal', 'Portugal', 'Bồ Đào Nha', 'โปรตุเกส', 'Portugal', 'البرتغال'),
    ('country.vn', 'country', '베트남', 'Vietnam', 'ベトナム', '越南', '越南', 'Vietnam', 'Vietnam', 'Vietnam', 'Vietnã', 'Việt Nam', 'เวียดนาม', 'Vietnam', 'فيتنام'),
    ('country.th', 'country', '태국', 'Thailand', 'タイ', '泰国', '泰國', 'Tailandia', 'Thaïlande', 'Thailand', 'Tailândia', 'Thái Lan', 'ประเทศไทย', 'Thailand', 'تايلاند'),
    ('country.id', 'country', '인도네시아', 'Indonesia', 'インドネシア', '印度尼西亚', '印尼', 'Indonesia', 'Indonésie', 'Indonesien', 'Indonésia', 'Indonesia', 'อินโดนีเซีย', 'Indonesia', 'إندونيسيا'),
    ('country.sa', 'country', '사우디아라비아', 'Saudi Arabia', 'サウジアラビア', '沙特阿拉伯', '沙烏地阿拉伯', 'Arabia Saudita', 'Arabie saoudite', 'Saudi-Arabien', 'Arábia Saudita', 'Ả Rập Xê Út', 'ซาอุดีอาระเบีย', 'Arab Saudi', 'السعودية')
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
  t.ja,
  t.zh_cn,
  t.zh_tw,
  t.es,
  t.fr,
  t.de,
  t.pt,
  t.vi,
  t.th,
  t.id_lang,
  t.ar,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar) AS (
  VALUES
    ('country.kr', '대한민국', 'South Korea', '韓国', '韩国', '韓國', 'Corea del Sur', 'Corée du Sud', 'Südkorea', 'Coreia do Sul', 'Hàn Quốc', 'เกาหลีใต้', 'Korea Selatan', 'كوريا الجنوبية'),
    ('country.us', '미국', 'United States', 'アメリカ合衆国', '美国', '美國', 'Estados Unidos', 'États-Unis', 'Vereinigte Staaten', 'Estados Unidos', 'Hoa Kỳ', 'สหรัฐอเมริกา', 'Amerika Serikat', 'الولايات المتحدة'),
    ('country.jp', '일본', 'Japan', '日本', '日本', '日本', 'Japón', 'Japon', 'Japan', 'Japão', 'Nhật Bản', 'ญี่ปุ่น', 'Jepang', 'اليابان'),
    ('country.cn', '중국', 'China', '中国', '中国', '中國', 'China', 'Chine', 'China', 'China', 'Trung Quốc', 'จีน', 'Tiongkok', 'الصين'),
    ('country.tw', '대만', 'Taiwan', '台湾', '台湾', '台灣', 'Taiwán', 'Taïwan', 'Taiwan', 'Taiwan', 'Đài Loan', 'ไต้หวัน', 'Taiwan', 'تايوان'),
    ('country.es', '스페인', 'Spain', 'スペイン', '西班牙', '西班牙', 'España', 'Espagne', 'Spanien', 'Espanha', 'Tây Ban Nha', 'สเปน', 'Spanyol', 'إسبانيا'),
    ('country.fr', '프랑스', 'France', 'フランス', '法国', '法國', 'Francia', 'France', 'Frankreich', 'França', 'Pháp', 'ฝรั่งเศส', 'Prancis', 'فرنسا'),
    ('country.de', '독일', 'Germany', 'ドイツ', '德国', '德國', 'Alemania', 'Allemagne', 'Deutschland', 'Alemanha', 'Đức', 'เยอรมนี', 'Jerman', 'ألمانيا'),
    ('country.pt', '포르투갈', 'Portugal', 'ポルトガル', '葡萄牙', '葡萄牙', 'Portugal', 'Portugal', 'Portugal', 'Portugal', 'Bồ Đào Nha', 'โปรตุเกส', 'Portugal', 'البرتغال'),
    ('country.vn', '베트남', 'Vietnam', 'ベトナム', '越南', '越南', 'Vietnam', 'Vietnam', 'Vietnam', 'Vietnã', 'Việt Nam', 'เวียดนาม', 'Vietnam', 'فيتنام'),
    ('country.th', '태국', 'Thailand', 'タイ', '泰国', '泰國', 'Tailandia', 'Thaïlande', 'Thailand', 'Tailândia', 'Thái Lan', 'ประเทศไทย', 'Thailand', 'تايلاند'),
    ('country.id', '인도네시아', 'Indonesia', 'インドネシア', '印度尼西亚', '印尼', 'Indonesia', 'Indonésie', 'Indonesien', 'Indonésia', 'Indonesia', 'อินโดนีเซีย', 'Indonesia', 'إندونيسيا'),
    ('country.sa', '사우디아라비아', 'Saudi Arabia', 'サウジアラビア', '沙特阿拉伯', '沙烏地阿拉伯', 'Arabia Saudita', 'Arabie saoudite', 'Saudi-Arabien', 'Arábia Saudita', 'Ả Rập Xê Út', 'ซาอุดีอาระเบีย', 'Arab Saudi', 'السعودية')
)
UPDATE i18n_translations
SET
  ko = (SELECT x.ko FROM t x WHERE x.key = i18n_translations.key),
  en = (SELECT x.en FROM t x WHERE x.key = i18n_translations.key),
  ja = (SELECT x.ja FROM t x WHERE x.key = i18n_translations.key),
  zh_cn = (SELECT x.zh_cn FROM t x WHERE x.key = i18n_translations.key),
  zh_tw = (SELECT x.zh_tw FROM t x WHERE x.key = i18n_translations.key),
  es = (SELECT x.es FROM t x WHERE x.key = i18n_translations.key),
  fr = (SELECT x.fr FROM t x WHERE x.key = i18n_translations.key),
  de = (SELECT x.de FROM t x WHERE x.key = i18n_translations.key),
  pt = (SELECT x.pt FROM t x WHERE x.key = i18n_translations.key),
  vi = (SELECT x.vi FROM t x WHERE x.key = i18n_translations.key),
  th = (SELECT x.th FROM t x WHERE x.key = i18n_translations.key),
  id_lang = (SELECT x.id_lang FROM t x WHERE x.key = i18n_translations.key),
  ar = (SELECT x.ar FROM t x WHERE x.key = i18n_translations.key),
  updated_at = datetime('now')
WHERE key IN (SELECT key FROM t);

-- 5) Currency i18n baseline (ko/en priority + other locale fallback)
WITH t(key, page, ko, en) AS (
  VALUES
    ('currency.krw', 'country', '원', 'Korean Won'),
    ('currency.usd', 'country', '달러', 'US Dollar'),
    ('currency.jpy', 'country', '엔', 'Japanese Yen'),
    ('currency.cny', 'country', '위안', 'Chinese Yuan'),
    ('currency.twd', 'country', '대만 달러', 'New Taiwan Dollar'),
    ('currency.eur', 'country', '유로', 'Euro'),
    ('currency.vnd', 'country', '동', 'Vietnamese Dong'),
    ('currency.thb', 'country', '바트', 'Thai Baht'),
    ('currency.idr', 'country', '루피아', 'Indonesian Rupiah'),
    ('currency.sar', 'country', '사우디 리얄', 'Saudi Riyal')
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
  t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en, t.en,
  1,
  datetime('now'),
  datetime('now')
FROM t;

WITH t(key, ko, en) AS (
  VALUES
    ('currency.krw', '원', 'Korean Won'),
    ('currency.usd', '달러', 'US Dollar'),
    ('currency.jpy', '엔', 'Japanese Yen'),
    ('currency.cny', '위안', 'Chinese Yuan'),
    ('currency.twd', '대만 달러', 'New Taiwan Dollar'),
    ('currency.eur', '유로', 'Euro'),
    ('currency.vnd', '동', 'Vietnamese Dong'),
    ('currency.thb', '바트', 'Thai Baht'),
    ('currency.idr', '루피아', 'Indonesian Rupiah'),
    ('currency.sar', '사우디 리얄', 'Saudi Riyal')
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
