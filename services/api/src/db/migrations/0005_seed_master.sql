-- Migration 0005: 마스터 데이터 Seed 및 테이블 정리
-- 이 파일은 오직 마스터 카테고리와 아이템의 기본 데이터만 다룹니다.

-- 1. 더 이상 사용하지 않는 복잡한 매핑 테이블 삭제 (질병 관리 단순화)
-- 이 테이블들은 타 테이블에서 참조되지 않으므로 안전하게 삭제 가능합니다.
DROP TABLE IF EXISTS disease_symptom_map;
DROP TABLE IF EXISTS symptom_metric_map;
DROP TABLE IF EXISTS metric_unit_map;
DROP TABLE IF EXISTS metric_logtype_map;

-- 2. 10종 마스터 카테고리 삽입 (부모)
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

-- 3. 기본 마스터 아이템 삽입 (자식)
-- breed (견종)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-breed-001', 'cat-breed', 'pomeranian',      1, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-002', 'cat-breed', 'maltese',         2, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-003', 'cat-breed', 'poodle',          3, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-004', 'cat-breed', 'golden_retriever',4, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-005', 'cat-breed', 'shih_tzu',        5, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-006', 'cat-breed', 'yorkshire',       6, 1, '{}', datetime('now'), datetime('now')),
('mi-breed-007', 'cat-breed', 'bichon',          7, 1, '{}', datetime('now'), datetime('now'));

-- industry (업종)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-ind-001', 'cat-industry', 'vet',         1, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-002', 'cat-industry', 'grooming',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-003', 'cat-industry', 'training',    3, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-004', 'cat-industry', 'hotel',       4, 1, '{}', datetime('now'), datetime('now')),
('mi-ind-005', 'cat-industry', 'supply',      5, 1, '{}', datetime('now'), datetime('now'));

-- disease (질병)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-dis-001', 'cat-disease', 'diabetes',         1, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-002', 'cat-disease', 'heart_disease',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-003', 'cat-disease', 'kidney_disease',   3, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-004', 'cat-disease', 'epilepsy',         4, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-005', 'cat-disease', 'hypothyroidism',   5, 1, '{}', datetime('now'), datetime('now')),
('mi-dis-006', 'cat-disease', 'cushing',          6, 1, '{}', datetime('now'), datetime('now'));

-- symptom (증상)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-sym-001', 'cat-symptom', 'hyperglycemia',  1, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-002', 'cat-symptom', 'hypoglycemia',   2, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-003', 'cat-symptom', 'insulin_needed', 3, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-004', 'cat-symptom', 'diet_control',   4, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-005', 'cat-symptom', 'hydration',      5, 1, '{}', datetime('now'), datetime('now')),
('mi-sym-006', 'cat-symptom', 'activity_mgmt',  6, 1, '{}', datetime('now'), datetime('now'));

-- metric (측정 지표)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-met-001', 'cat-metric', 'blood_glucose',   1, 1, '{}', datetime('now'), datetime('now')),
('mi-met-002', 'cat-metric', 'insulin_dose',    2, 1, '{}', datetime('now'), datetime('now')),
('mi-met-003', 'cat-metric', 'food_weight',     3, 1, '{}', datetime('now'), datetime('now')),
('mi-met-004', 'cat-metric', 'calorie_intake',  4, 1, '{}', datetime('now'), datetime('now')),
('mi-met-005', 'cat-metric', 'water_intake',    5, 1, '{}', datetime('now'), datetime('now')),
('mi-met-006', 'cat-metric', 'duration',        6, 1, '{}', datetime('now'), datetime('now')),
('mi-met-007', 'cat-metric', 'body_weight',     7, 1, '{}', datetime('now'), datetime('now'));

-- unit (단위)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-unit-001', 'cat-unit', 'mg_dl',   1, 1, '{"symbol":"mg/dL"}',  datetime('now'), datetime('now')),
('mi-unit-002', 'cat-unit', 'mmol_l',  2, 1, '{"symbol":"mmol/L"}', datetime('now'), datetime('now')),
('mi-unit-003', 'cat-unit', 'iu',      3, 1, '{"symbol":"IU"}',     datetime('now'), datetime('now')),
('mi-unit-004', 'cat-unit', 'g',       4, 1, '{"symbol":"g"}',      datetime('now'), datetime('now')),
('mi-unit-005', 'cat-unit', 'kcal',    5, 1, '{"symbol":"kcal"}',   datetime('now'), datetime('now')),
('mi-unit-006', 'cat-unit', 'ml',      6, 1, '{"symbol":"ml"}',     datetime('now'), datetime('now')),
('mi-unit-007', 'cat-unit', 'min',     7, 1, '{"symbol":"min"}',    datetime('now'), datetime('now')),
('mi-unit-008', 'cat-unit', 'kg',      8, 1, '{"symbol":"kg"}',     datetime('now'), datetime('now'));

-- log_type (기록 유형)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-lt-001', 'cat-log_type', 'blood_glucose_log',  1, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-002', 'cat-log_type', 'insulin_log',        2, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-003', 'cat-log_type', 'meal_log',           3, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-004', 'cat-log_type', 'water_log',          4, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-005', 'cat-log_type', 'activity_log',       5, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-006', 'cat-log_type', 'symptom_event_log',  6, 1, '{}', datetime('now'), datetime('now')),
('mi-lt-007', 'cat-log_type', 'lab_test_log',       7, 1, '{}', datetime('now'), datetime('now'));

-- interest (관심사)
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-int-001', 'cat-interest', 'health_care',   1, 1, '{}', datetime('now'), datetime('now')),
('mi-int-002', 'cat-interest', 'grooming',      2, 1, '{}', datetime('now'), datetime('now')),
('mi-int-003', 'cat-interest', 'training',      3, 1, '{}', datetime('now'), datetime('now')),
('mi-int-004', 'cat-interest', 'nutrition',     4, 1, '{}', datetime('now'), datetime('now')),
('mi-int-005', 'cat-interest', 'social',        5, 1, '{}', datetime('now'), datetime('now'));

-- ad_slot
INSERT OR IGNORE INTO master_items (id, category_id, key, sort_order, is_active, metadata, created_at, updated_at) VALUES
('mi-ads-001', 'cat-ad_slot', 'feed_list_banner',    1, 1, '{}', datetime('now'), datetime('now')),
('mi-ads-002', 'cat-ad_slot', 'store_detail_banner', 2, 1, '{}', datetime('now'), datetime('now'));

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0005_seed_master');
