-- =============================================================================
-- Petfolio — PostgreSQL Seed Data
-- =============================================================================
-- Essential structural data for bootstrapping.
-- All statements are idempotent (ON CONFLICT DO NOTHING).
-- Master data (categories/items) is managed via the API — NOT seeded here.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. platform_settings — required system configuration keys
-- ---------------------------------------------------------------------------
INSERT INTO platform_settings (id, setting_key, setting_value, description, created_at, updated_at)
VALUES
  ('ps-google-places-key',  'google_places_api_key',      '', 'Google Places API key',       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ps-google-oauth-id',    'google_oauth_client_id',     '', 'Google OAuth client id',      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ps-google-oauth-redir', 'google_oauth_redirect_uri',  '', 'Google OAuth redirect uri',   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (setting_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. ad_config — global advertising configuration (disabled by default)
-- ---------------------------------------------------------------------------
INSERT INTO ad_config (id, global_enabled, updated_at)
VALUES
  ('ad-config-default', false, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. ad_slots — default ad slot definitions
--    no_health_zone = true prevents ads on health/disease screens (PRD rule)
-- ---------------------------------------------------------------------------
INSERT INTO ad_slots (id, slot_key, ad_unit_id, is_enabled, no_health_zone, impression_count, updated_at)
VALUES
  ('slot-feed-banner',       'feed_banner',       NULL, false, false, 0, CURRENT_TIMESTAMP),
  ('slot-feed-interstitial', 'feed_interstitial', NULL, false, false, 0, CURRENT_TIMESTAMP),
  ('slot-pet-detail-banner', 'pet_detail_banner', NULL, false, false, 0, CURRENT_TIMESTAMP),
  ('slot-health-banner',     'health_banner',     NULL, false, true,  0, CURRENT_TIMESTAMP),
  ('slot-explore-banner',    'explore_banner',    NULL, false, false, 0, CURRENT_TIMESTAMP)
ON CONFLICT (slot_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. admin user — bootstrap admin account
--    Password hash is a placeholder; replace with real PBKDF2 hash in production.
--    The API auth flow accepts this for initial setup.
-- ---------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'seed-admin-001',
  'admin@petfolio.com',
  'PLACEHOLDER_HASH_REPLACE_ON_FIRST_LOGIN',
  'admin',
  'active',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Record seed migration
-- ---------------------------------------------------------------------------
INSERT INTO schema_migrations (version)
VALUES ('pg_002_seed')
ON CONFLICT DO NOTHING;
