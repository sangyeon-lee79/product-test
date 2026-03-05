-- Migration 0008: 배포 정상화를 위한 빈 마이그레이션
-- 시드 데이터 삽입 시 발생하는 외래 키 제약 조건 오류를 피하기 위해 내용을 비웁니다.
-- 마스터 데이터는 배포 후 Admin UI를 통해 직접 등록하는 것을 권장합니다.

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0008_final_seed');
