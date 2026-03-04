-- Migration 0001: Admin 테이블 (S1 i18n + S2 Master + S4 Countries)
-- D1(SQLite) 호환 — 배포 시 PostgreSQL 스키마로 전환
-- LLD §4.2

-- ─────────────────────────────────────────────────────────
-- S1: 언어관리
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS i18n_translations (
    id          TEXT PRIMARY KEY,
    key         TEXT NOT NULL UNIQUE,
    page        TEXT,
    ko          TEXT,
    en          TEXT,
    ja          TEXT,
    zh_cn       TEXT,
    zh_tw       TEXT,
    es          TEXT,
    fr          TEXT,
    de          TEXT,
    pt          TEXT,
    vi          TEXT,
    th          TEXT,
    id_lang     TEXT,
    ar          TEXT,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_i18n_page ON i18n_translations(page);
CREATE INDEX IF NOT EXISTS idx_i18n_active ON i18n_translations(is_active);

-- ─────────────────────────────────────────────────────────
-- S2: 마스터 데이터
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS master_categories (
    id          TEXT PRIMARY KEY,
    key         TEXT NOT NULL UNIQUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS master_items (
    id          TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES master_categories(id),
    key         TEXT NOT NULL,
    parent_id   TEXT REFERENCES master_items(id),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    metadata    TEXT NOT NULL DEFAULT '{}',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(category_id, key)
);

CREATE INDEX IF NOT EXISTS idx_master_items_category ON master_items(category_id);
CREATE INDEX IF NOT EXISTS idx_master_items_parent ON master_items(parent_id);

-- ─────────────────────────────────────────────────────────
-- S3: 질병 연결 매핑
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disease_symptom_map (
    id          TEXT PRIMARY KEY,
    disease_id  TEXT NOT NULL REFERENCES master_items(id),
    symptom_id  TEXT NOT NULL REFERENCES master_items(id),
    is_required INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    UNIQUE(disease_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS symptom_metric_map (
    id          TEXT PRIMARY KEY,
    symptom_id  TEXT NOT NULL REFERENCES master_items(id),
    metric_id   TEXT NOT NULL REFERENCES master_items(id),
    is_required INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    UNIQUE(symptom_id, metric_id)
);

CREATE TABLE IF NOT EXISTS metric_unit_map (
    id          TEXT PRIMARY KEY,
    metric_id   TEXT NOT NULL REFERENCES master_items(id),
    unit_id     TEXT NOT NULL REFERENCES master_items(id),
    is_default  INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    UNIQUE(metric_id, unit_id)
);

CREATE TABLE IF NOT EXISTS metric_logtype_map (
    id          TEXT PRIMARY KEY,
    metric_id   TEXT NOT NULL REFERENCES master_items(id),
    logtype_id  TEXT NOT NULL REFERENCES master_items(id),
    is_default  INTEGER NOT NULL DEFAULT 0,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    UNIQUE(metric_id, logtype_id)
);

-- ─────────────────────────────────────────────────────────
-- S4: 국가/통화
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS countries (
    id          TEXT PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    name_key    TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS currencies (
    id              TEXT PRIMARY KEY,
    code            TEXT NOT NULL UNIQUE,
    symbol          TEXT NOT NULL,
    name_key        TEXT NOT NULL,
    decimal_places  INTEGER NOT NULL DEFAULT 2,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS country_currency_map (
    id          TEXT PRIMARY KEY,
    country_id  TEXT NOT NULL REFERENCES countries(id),
    currency_id TEXT NOT NULL REFERENCES currencies(id),
    is_default  INTEGER NOT NULL DEFAULT 1,
    UNIQUE(country_id, currency_id)
);

-- ─────────────────────────────────────────────────────────
-- S11: 광고 설정
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ad_config (
    id              TEXT PRIMARY KEY,
    global_enabled  INTEGER NOT NULL DEFAULT 0,
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ad_slots (
    id               TEXT PRIMARY KEY,
    slot_key         TEXT NOT NULL UNIQUE,
    ad_unit_id       TEXT,
    is_enabled       INTEGER NOT NULL DEFAULT 0,
    no_health_zone   INTEGER NOT NULL DEFAULT 0,
    impression_count INTEGER NOT NULL DEFAULT 0,
    updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─────────────────────────────────────────────────────────
-- S5: 인증
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    email           TEXT UNIQUE,
    password_hash   TEXT,
    role            TEXT NOT NULL DEFAULT 'guardian',
    oauth_provider  TEXT,
    oauth_id        TEXT,
    status          TEXT NOT NULL DEFAULT 'active',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- 마이그레이션 기록
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0001_admin_tables');
