-- Migration 000: 초기 스키마 설정
-- S0 — 마이그레이션 기초 구조 확립
-- LLD §4 데이터베이스 스키마 기반
-- 실제 PostgreSQL 연결 후 순서대로 실행

-- 마이그레이션 히스토리 테이블 (D1/SQLite 호환)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('000_init');
