-- Migration 0005: 마스터 데이터 및 국가/통화 Seed (최종 통합본)
-- 참조 무결성 오류를 방지하기 위해 오직 INSERT OR IGNORE 명령만 사용합니다.

-- 1. 마스터 카테고리 (부모)
INSERT OR IGNORE INTO master_categories (id, key, sort_order, is_active, created_at, updated_at) VALUES
('cat-breed',       'breed',       1,  1, datetime('now'), datetime('now')),
('cat-industry',    'industry',    2,  1, datetime('now'), datetime('now')),
('cat-disease',     'disease',     3,  1, datetime('now'), datetime('now')),
('cat-symptom',     'symptom',     4,  1, datetime('now'), datetime('now')),
('cat-metric',      'metric',      5,  1, datetime('now'), datetime('now')),
('cat-unit',        'unit',        6,  1, datetime('now'), datetime('now')),
('cat-log_type',    'log_type',    7,  1, datetime('now'), datetime('now')),
('cat-interest',    'interest',    8,  1, datetime('now'), datetime('now')),
('cat-country_ref', 'country_ref', 9,  1, datetime('now'), datetime('now')),
('cat-ad_slot',     'ad_slot',     10, 1, datetime('now'), datetime('now'));

-- 2. 마스터 아이템 (자식)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-breed-001', 'cat-breed', 'pomeranian',      1, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-002', 'cat-breed', 'maltese',         2, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-003', 'cat-breed', 'poodle',          3, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-004', 'cat-breed', 'golden_retriever',4, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-005', 'cat-breed', 'shih_tzu',        5, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-006', 'cat-breed', 'yorkshire',       6, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-007', 'cat-breed', 'bichon',          7, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-001', 'cat-industry', 'vet',         1, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-002', 'cat-industry', 'grooming',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-003', 'cat-industry', 'training',    3, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-004', 'cat-industry', 'hotel',       4, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-005', 'cat-industry', 'supply',      5, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-001', 'cat-disease', 'diabetes',         1, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-002', 'cat-disease', 'heart_disease',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-003', 'cat-disease', 'kidney_disease',   3, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-004', 'cat-disease', 'epilepsy',         4, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-005', 'cat-disease', 'hypothyroidism',   5, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-006', 'cat-disease', 'cushing',          6, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-001', 'cat-symptom', 'hyperglycemia',  1, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-002', 'cat-symptom', 'hypoglycemia',   2, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-003', 'cat-symptom', 'insulin_needed', 3, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-004', 'cat-symptom', 'diet_control',   4, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-005', 'cat-symptom', 'hydration',      5, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-006', 'cat-symptom', 'activity_mgmt',  6, 1, '{}', datetime('now'), datetime('now')),
('mi-met-001', 'cat-metric', 'blood_glucose',   1, 1, '{}', datetime('now'), datetime('now')),
('mi-met-002', 'cat-metric', 'insulin_dose',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-met-003', 'cat-metric', 'food_weight',     3, 1, '{}', datetime('now'), datetime('now')),
('mi-met-004', 'cat-metric', 'calorie_intake',  4, 1, '{}', datetime('now'), datetime('now')),
('mi-met-005', 'cat-metric', 'water_intake',    5, 1, '{}', datetime('now'), datetime('now')),
('mi-met-006', 'cat-metric', 'duration',        6, 1, '{}', datetime('now'), datetime('now')),
('mi-met-007', 'cat-metric', 'body_weight',     7, 1, '{}', datetime('now'), datetime('now')),
('mi-unit-001', 'cat-unit', 'mg_dl',   1, 1, '{"symbol":"mg/dL"}',  datetime('now'), datetime('now')),
('mi-unit-002', 'cat-unit', 'mmol_l',  2, 1, '{"symbol":"mmol/L"}', datetime('now'), datetime('now')),
('mi-unit-003', 'cat-unit', 'iu',      3, 1, '{"symbol":"IU"}',     datetime('now'), datetime('now')),
('mi-unit-004', 'cat-unit', 'g',       4, 1, '{"symbol":"g"}',      datetime('now'), datetime('now')),
('mi-unit-005', 'cat-unit', 'kcal',    5, 1, '{"symbol":"kcal"}',   datetime('now'), datetime('now')),
('mi-unit-006', 'cat-unit', 'ml',      6, 1, '{"symbol":"ml"}',     datetime('now'), datetime('now')),
('mi-unit-007', 'cat-unit', 'min',     7, 1, '{"symbol":"min"}',    datetime('now'), datetime('now')),
('mi-unit-008', 'cat-unit', 'kg',      8, 1, '{"symbol":"kg"}',     datetime('now'), datetime('now')),
('mi-lt-001', 'cat-log_type', 'blood_glucose_log',  1, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-002', 'cat-log_type', 'insulin_log',        2, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-003', 'cat-log_type', 'meal_log',           3, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-004', 'cat-log_type', 'water_log',          4, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-005', 'cat-log_type', 'activity_log',       5, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-006', 'cat-log_type', 'symptom_event_log',  6, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-007', 'cat-log_type', 'lab_test_log',       7, 1, '{}', datetime('now'), datetime('now')),
('mi-int-001', 'cat-interest', 'health_care',   1, 1, '{}', datetime('now'), datetime('now')),
('mi-int-002', 'cat-interest', 'grooming',      2, 1, '{}', datetime('now'), datetime('now')),
('mi-int-003', 'cat-interest', 'training',      3, 1, '{}', datetime('now'), datetime('now')),
('mi-int-004', 'cat-interest', 'nutrition',     4, 1, '{}', datetime('now'), datetime('now')),
('mi-int-005', 'cat-interest', 'social',        5, 1, '{}', datetime('now'), datetime('now')),
('mi-ads-001', 'cat-ad_slot', 'feed_list_banner',    1, 1, '{}', datetime('now'), datetime('now')),
('mi-ads-002', 'cat-ad_slot', 'store_detail_banner', 2, 1, '{}', datetime('now'), datetime('now'));

-- 3. 국가 및 통화
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
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0005_seed_master');
