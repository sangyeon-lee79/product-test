-- 093_feed_card_settings.sql
-- Feed card management: insertion settings + dummy card data for admin preview

-- feed_card_settings: per-card-type insertion rules
CREATE TABLE IF NOT EXISTS feed_card_settings (
  id              TEXT PRIMARY KEY,
  card_type       TEXT NOT NULL UNIQUE,
  is_enabled      BOOLEAN NOT NULL DEFAULT true,
  interval_n      INTEGER NOT NULL DEFAULT 5,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  rotation_order  INTEGER NOT NULL DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- feed_dummy_cards: dummy card data for ranking/recommended tabs
CREATE TABLE IF NOT EXISTS feed_dummy_cards (
  id              TEXT PRIMARY KEY,
  tab_type        TEXT NOT NULL,
  title           TEXT,
  subtitle        TEXT,
  description     TEXT,
  image_url       TEXT,
  link_url        TEXT,
  avatar_url      TEXT,
  display_name    TEXT,
  badge_text      TEXT,
  score           INTEGER DEFAULT 0,
  region          TEXT,
  breed_info      TEXT,
  pet_type        TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_dummy_cards_tab_active
  ON feed_dummy_cards(tab_type, is_active);

-- Seed default card settings
INSERT INTO feed_card_settings (id, card_type, is_enabled, interval_n, sort_order, rotation_order)
VALUES
  (gen_random_uuid()::text, 'ranking',     true,  5, 1, 1),
  (gen_random_uuid()::text, 'recommended', true,  8, 2, 0),
  (gen_random_uuid()::text, 'ad',          false, 10, 3, 0)
ON CONFLICT (card_type) DO NOTHING;
