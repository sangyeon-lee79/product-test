-- 066_stores_services.sql — S9: Provider 매장 + 서비스 + 할인 테이블
-- stores, store_industries, services, service_discounts

-- ---------------------------------------------------------------------------
-- 1. stores — Provider 매장
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id                       TEXT PRIMARY KEY,
  owner_id                 TEXT NOT NULL REFERENCES users(id),
  name                     TEXT NOT NULL,
  name_translations        JSONB NOT NULL DEFAULT '{}',
  description              TEXT,
  description_translations JSONB NOT NULL DEFAULT '{}',
  address                  TEXT,
  phone                    TEXT,
  country_id               TEXT REFERENCES countries(id),
  currency_id              TEXT REFERENCES currencies(id),
  latitude                 DECIMAL(10,7),
  longitude                DECIMAL(10,7),
  avatar_url               TEXT,
  status                   TEXT NOT NULL DEFAULT 'active',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_owner    ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_country  ON stores(country_id);
CREATE INDEX IF NOT EXISTS idx_stores_status   ON stores(status);

-- ---------------------------------------------------------------------------
-- 2. store_industries — 매장 업종 매핑 (N:M via master_items)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_industries (
  id          TEXT PRIMARY KEY,
  store_id    TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  industry_id TEXT NOT NULL REFERENCES master_items(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, industry_id)
);

CREATE INDEX IF NOT EXISTS idx_store_industries_store ON store_industries(store_id);

-- ---------------------------------------------------------------------------
-- 3. services — 매장 서비스
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id                       TEXT PRIMARY KEY,
  store_id                 TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL,
  name_translations        JSONB NOT NULL DEFAULT '{}',
  description              TEXT,
  description_translations JSONB NOT NULL DEFAULT '{}',
  price                    DECIMAL(12,2),
  currency_id              TEXT REFERENCES currencies(id),
  photo_urls               JSONB NOT NULL DEFAULT '[]',
  sort_order               INTEGER NOT NULL DEFAULT 0,
  is_active                BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_store    ON services(store_id);
CREATE INDEX IF NOT EXISTS idx_services_active   ON services(is_active);

-- ---------------------------------------------------------------------------
-- 4. service_discounts — 서비스 할인
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_discounts (
  id            TEXT PRIMARY KEY,
  service_id    TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  discount_rate DECIMAL(5,2) NOT NULL,
  start_date    DATE,
  end_date      DATE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_discounts_service ON service_discounts(service_id);
