-- Migration 0006: 국가 및 통화 데이터 Seed
-- 마스터 데이터(0005)와 분리하여 참조 무결성 오류를 방지합니다.

-- 1. 통화 데이터 삽입
INSERT OR IGNORE INTO currencies (id, code, symbol, name_key, decimal_places, is_active, created_at) VALUES
('cur-krw', 'KRW', '₩',   'currency.krw', 0, 1, datetime('now')),
('cur-usd', 'USD', '$',   'currency.usd', 2, 1, datetime('now')),
('cur-jpy', 'JPY', '¥',   'currency.jpy', 0, 1, datetime('now')),
('cur-eur', 'EUR', '€',   'currency.eur', 2, 1, datetime('now')),
('cur-cny', 'CNY', '¥',   'currency.cny', 2, 1, datetime('now')),
('cur-gbp', 'GBP', '£',   'currency.gbp', 2, 1, datetime('now')),
('cur-thb', 'THB', '฿',   'currency.thb', 2, 1, datetime('now')),
('cur-vnd', 'VND', '₫',   'currency.vnd', 0, 1, datetime('now')),
('cur-idr', 'IDR', 'Rp',  'currency.idr', 0, 1, datetime('now')),
('cur-brl', 'BRL', 'R$',  'currency.brl', 2, 1, datetime('now'));

-- 2. 국가 데이터 삽입
INSERT OR IGNORE INTO countries (id, code, name_key, is_active, sort_order, created_at) VALUES
('ctr-kr', 'KR', 'country.kr', 1, 1,  datetime('now')),
('ctr-us', 'US', 'country.us', 1, 2,  datetime('now')),
('ctr-jp', 'JP', 'country.jp', 1, 3,  datetime('now')),
('ctr-cn', 'CN', 'country.cn', 1, 4,  datetime('now')),
('ctr-tw', 'TW', 'country.tw', 1, 5,  datetime('now')),
('ctr-gb', 'GB', 'country.gb', 1, 6,  datetime('now')),
('ctr-de', 'DE', 'country.de', 1, 7,  datetime('now')),
('ctr-fr', 'FR', 'country.fr', 1, 8,  datetime('now')),
('ctr-br', 'BR', 'country.br', 1, 9,  datetime('now')),
('ctr-th', 'TH', 'country.th', 1, 10, datetime('now')),
('ctr-vn', 'VN', 'country.vn', 1, 11, datetime('now')),
('ctr-id', 'ID', 'country.id', 1, 12, datetime('now'));

-- 3. 국가-통화 매핑 삽입
INSERT OR IGNORE INTO country_currency_map (id, country_id, currency_id, is_default) VALUES
('ccm-kr', 'ctr-kr', 'cur-krw', 1),
('ccm-us', 'ctr-us', 'cur-usd', 1),
('ccm-jp', 'ctr-jp', 'cur-jpy', 1),
('ccm-cn', 'ctr-cn', 'cur-cny', 1),
('ccm-tw', 'ctr-tw', 'cur-cny', 1),
('ccm-gb', 'ctr-gb', 'cur-gbp', 1),
('ccm-de', 'ctr-de', 'cur-eur', 1),
('ccm-fr', 'ctr-fr', 'cur-eur', 1),
('ccm-br', 'ctr-br', 'cur-brl', 1),
('ccm-th', 'ctr-th', 'cur-thb', 1),
('ccm-vn', 'ctr-vn', 'cur-vnd', 1),
('ccm-id', 'ctr-id', 'cur-idr', 1);

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0006_seed_countries');
