-- Migration 0006: 더 이상 사용하지 않는 질병 매핑 테이블 삭제
-- S3 영역에서 사용하던 복잡한 매핑 테이블들을 제거합니다.

DROP TABLE IF EXISTS disease_symptom_map;
DROP TABLE IF EXISTS symptom_metric_map;
DROP TABLE IF EXISTS metric_unit_map;
DROP TABLE IF EXISTS metric_logtype_map;

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0006_cleanup_disease_maps');
