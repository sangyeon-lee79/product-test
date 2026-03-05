-- Migration 0007: 사용하지 않는 구형 매핑 테이블 삭제
-- 0005, 0006 마이그레이션이 완료된 후 안전하게 테이블을 삭제합니다.

DROP TABLE IF EXISTS disease_symptom_map;
DROP TABLE IF EXISTS symptom_metric_map;
DROP TABLE IF EXISTS metric_unit_map;
DROP TABLE IF EXISTS metric_logtype_map;

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0007_cleanup_unused_tables');
