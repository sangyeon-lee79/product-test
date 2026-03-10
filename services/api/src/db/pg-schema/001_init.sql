-- =============================================================================
-- Petfolio — Consolidated PostgreSQL Schema
-- =============================================================================
-- Source: 82 SQLite (D1) migrations consolidated into a single idempotent DDL.
-- Conversion rules applied:
--   INTEGER boolean columns → BOOLEAN
--   TEXT date/timestamp columns → TIMESTAMPTZ
--   REAL → DOUBLE PRECISION
--   datetime('now') → CURRENT_TIMESTAMP
--   AUTOINCREMENT → GENERATED ALWAYS AS IDENTITY
--   INSERT OR IGNORE → INSERT ... ON CONFLICT DO NOTHING
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. schema_migrations — migration history tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 2. i18n_translations — 13-language key-value translation store
-- ---------------------------------------------------------------------------
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
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_i18n_page   ON i18n_translations(page);
CREATE INDEX IF NOT EXISTS idx_i18n_active ON i18n_translations(is_active);

-- ---------------------------------------------------------------------------
-- 3. master_categories — top-level grouping for master data
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_categories (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT,
  description TEXT,
  parent_id   TEXT REFERENCES master_categories(id),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 4. device_types — physical device categories (glucose meter, CGM, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_types (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name_ko     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 5. master_items — hierarchical master data items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_items (
  id              TEXT PRIMARY KEY,
  category_id     TEXT NOT NULL REFERENCES master_categories(id),
  parent_item_id  TEXT REFERENCES master_items(id),
  code            TEXT NOT NULL,
  name            TEXT,
  description     TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active',
  metadata        TEXT NOT NULL DEFAULT '{}',
  device_type_id  TEXT REFERENCES device_types(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, code)
);

CREATE INDEX IF NOT EXISTS idx_master_items_category ON master_items(category_id);
CREATE INDEX IF NOT EXISTS idx_master_items_parent   ON master_items(parent_item_id);

-- ---------------------------------------------------------------------------
-- 6. disease_symptom_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disease_symptom_map (
  id          TEXT PRIMARY KEY,
  disease_id  TEXT NOT NULL REFERENCES master_items(id),
  symptom_id  TEXT NOT NULL REFERENCES master_items(id),
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(disease_id, symptom_id)
);

-- ---------------------------------------------------------------------------
-- 7. symptom_metric_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symptom_metric_map (
  id          TEXT PRIMARY KEY,
  symptom_id  TEXT NOT NULL REFERENCES master_items(id),
  metric_id   TEXT NOT NULL REFERENCES master_items(id),
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(symptom_id, metric_id)
);

-- ---------------------------------------------------------------------------
-- 8. metric_unit_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metric_unit_map (
  id          TEXT PRIMARY KEY,
  metric_id   TEXT NOT NULL REFERENCES master_items(id),
  unit_id     TEXT NOT NULL REFERENCES master_items(id),
  is_default  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(metric_id, unit_id)
);

-- ---------------------------------------------------------------------------
-- 9. metric_logtype_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metric_logtype_map (
  id          TEXT PRIMARY KEY,
  metric_id   TEXT NOT NULL REFERENCES master_items(id),
  logtype_id  TEXT NOT NULL REFERENCES master_items(id),
  is_default  BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(metric_id, logtype_id)
);

-- ---------------------------------------------------------------------------
-- 10. countries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name_key    TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 11. currencies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS currencies (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  symbol          TEXT NOT NULL,
  name_key        TEXT NOT NULL,
  decimal_places  INTEGER NOT NULL DEFAULT 2,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 12. country_currency_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS country_currency_map (
  id          TEXT PRIMARY KEY,
  country_id  TEXT NOT NULL REFERENCES countries(id),
  currency_id TEXT NOT NULL REFERENCES currencies(id),
  is_default  BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(country_id, currency_id)
);

-- ---------------------------------------------------------------------------
-- 13. ad_config — global advertising toggle
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_config (
  id              TEXT PRIMARY KEY,
  global_enabled  BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 14. ad_slots — individual ad placement configuration
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ad_slots (
  id               TEXT PRIMARY KEY,
  slot_key         TEXT NOT NULL UNIQUE,
  ad_unit_id       TEXT,
  is_enabled       BOOLEAN NOT NULL DEFAULT false,
  no_health_zone   BOOLEAN NOT NULL DEFAULT false,
  impression_count INTEGER NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 15. users — authentication accounts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT UNIQUE,
  password_hash   TEXT,
  role            TEXT NOT NULL DEFAULT 'guardian',
  oauth_provider  TEXT,
  oauth_id        TEXT,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

-- ---------------------------------------------------------------------------
-- 16. user_profiles — guardian public profile (1:1 with users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  handle              TEXT UNIQUE,
  display_name        TEXT,
  avatar_url          TEXT,
  bio                 TEXT,
  bio_translations    TEXT NOT NULL DEFAULT '{}',
  country_id          TEXT REFERENCES countries(id),
  language            TEXT NOT NULL DEFAULT 'ko',
  timezone            TEXT NOT NULL DEFAULT 'Asia/Seoul',
  interests           TEXT NOT NULL DEFAULT '[]',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user    ON user_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle ON user_profiles(handle);

-- ---------------------------------------------------------------------------
-- 17. pets — pet records (after 0021 refactor + 0010/0020 extensions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pets (
  id                      TEXT PRIMARY KEY,
  guardian_user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  microchip_number        TEXT,
  pet_type_id             TEXT REFERENCES master_items(id),
  breed_id                TEXT REFERENCES master_items(id),
  gender_id               TEXT REFERENCES master_items(id),
  life_stage_id           TEXT REFERENCES master_items(id),
  body_size_id            TEXT REFERENCES master_items(id),
  country_id              TEXT REFERENCES countries(id),
  diet_type_id            TEXT REFERENCES master_items(id),
  coat_length_id          TEXT REFERENCES master_items(id),
  coat_type_id            TEXT REFERENCES master_items(id),
  activity_level_id       TEXT REFERENCES master_items(id),
  health_level_id         TEXT REFERENCES master_items(id),
  neuter_status_id        TEXT REFERENCES master_items(id),
  medication_status_id    TEXT REFERENCES master_items(id),
  weight_unit_id          TEXT REFERENCES master_items(id),
  health_condition_level_id TEXT REFERENCES master_items(id),
  living_style_id         TEXT REFERENCES master_items(id),
  ownership_type_id       TEXT REFERENCES master_items(id),
  grooming_cycle_id       TEXT REFERENCES master_items(id),
  gender_legacy           TEXT,
  species_legacy          TEXT,
  birth_date              TEXT,
  birthday                TEXT,
  weight_kg               DOUBLE PRECISION,
  current_weight          DOUBLE PRECISION,
  is_neutered             BOOLEAN NOT NULL DEFAULT false,
  avatar_url              TEXT,
  status                  TEXT NOT NULL DEFAULT 'active',
  color_ids               TEXT NOT NULL DEFAULT '[]',
  allergy_ids             TEXT NOT NULL DEFAULT '[]',
  disease_history_ids     TEXT NOT NULL DEFAULT '[]',
  symptom_tag_ids         TEXT NOT NULL DEFAULT '[]',
  vaccination_ids         TEXT NOT NULL DEFAULT '[]',
  temperament_ids         TEXT NOT NULL DEFAULT '[]',
  notes                   TEXT,
  intro_text              TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pets_guardian ON pets(guardian_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pets_microchip_unique
  ON pets(microchip_number)
  WHERE microchip_number IS NOT NULL AND TRIM(microchip_number) <> '' AND status != 'deleted';

-- ---------------------------------------------------------------------------
-- 18. translation_memory — Google Cloud Translation cache
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS translation_memory (
  id           TEXT PRIMARY KEY,
  source_ko    TEXT NOT NULL UNIQUE,
  en           TEXT,
  ja           TEXT,
  zh_cn        TEXT,
  zh_tw        TEXT,
  es           TEXT,
  fr           TEXT,
  de           TEXT,
  pt           TEXT,
  vi           TEXT,
  th           TEXT,
  id_lang      TEXT,
  ar           TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  use_count    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_translation_memory_source_ko ON translation_memory(source_ko);

-- ---------------------------------------------------------------------------
-- 19. translation_quota_usage — API quota tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS translation_quota_usage (
  bucket_key    TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  char_count    INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 20. bookings — service booking core (S10)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                   TEXT PRIMARY KEY,
  guardian_id           TEXT NOT NULL REFERENCES users(id),
  supplier_id           TEXT NOT NULL REFERENCES users(id),
  pet_id               TEXT REFERENCES pets(id),
  service_id           TEXT,
  business_category_id TEXT REFERENCES master_items(id),
  status               TEXT NOT NULL DEFAULT 'created',
  requested_date       TEXT,
  requested_time       TEXT,
  notes                TEXT,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_guardian  ON bookings(guardian_id);
CREATE INDEX IF NOT EXISTS idx_bookings_supplier  ON bookings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status    ON bookings(status);

-- ---------------------------------------------------------------------------
-- 21. feed_posts — unified SNS feed (replaces original feeds table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_posts (
  id                  TEXT PRIMARY KEY,
  author_user_id      TEXT NOT NULL REFERENCES users(id),
  author_role         TEXT NOT NULL,
  feed_type           TEXT NOT NULL,
  visibility_scope    TEXT NOT NULL DEFAULT 'public',
  caption             TEXT,
  status              TEXT NOT NULL DEFAULT 'published',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_posts_author ON feed_posts(author_user_id);

-- ---------------------------------------------------------------------------
-- 22. feed_post_pets — many-to-many feed ↔ pet mapping
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_post_pets (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  pet_id      TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_feed_post_pets_post ON feed_post_pets(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_post_pets_pet  ON feed_post_pets(pet_id);

-- ---------------------------------------------------------------------------
-- 23. feed_media — media attachments for feed posts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_media (
  id              TEXT PRIMARY KEY,
  post_id         TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  media_type      TEXT NOT NULL,
  media_url       TEXT NOT NULL,
  thumbnail_url   TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- 24. feed_likes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_likes (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_likes_feed ON feed_likes(post_id);

-- ---------------------------------------------------------------------------
-- 25. feed_comments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_comments (
  id                  TEXT PRIMARY KEY,
  post_id             TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_user_id      TEXT NOT NULL REFERENCES users(id),
  parent_comment_id   TEXT REFERENCES feed_comments(id),
  content             TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id, created_at);

-- ---------------------------------------------------------------------------
-- 26. feed_publish_requests — supplier → guardian publish approval
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_publish_requests (
  id              TEXT PRIMARY KEY,
  booking_id      TEXT NOT NULL REFERENCES bookings(id),
  supplier_id     TEXT NOT NULL REFERENCES users(id),
  guardian_id     TEXT NOT NULL REFERENCES users(id),
  content         TEXT,
  media_urls      TEXT NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at     TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- 27. health_records — unified pet health records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_records (
  id                  TEXT PRIMARY KEY,
  pet_id              TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_type         TEXT NOT NULL,
  symptom_id          TEXT REFERENCES master_items(id),
  disease_id          TEXT REFERENCES master_items(id),
  description         TEXT,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id  TEXT NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_records_pet ON health_records(pet_id);

-- ---------------------------------------------------------------------------
-- 28. friend_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friend_requests (
  id                  TEXT PRIMARY KEY,
  requester_user_id   TEXT NOT NULL REFERENCES users(id),
  receiver_user_id    TEXT NOT NULL REFERENCES users(id),
  requester_role      TEXT NOT NULL,
  receiver_role       TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'request_sent',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at        TIMESTAMPTZ,
  UNIQUE(requester_user_id, receiver_user_id)
);

-- ---------------------------------------------------------------------------
-- 29. friendships
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
  id              TEXT PRIMARY KEY,
  user_a_id       TEXT NOT NULL REFERENCES users(id),
  user_b_id       TEXT NOT NULL REFERENCES users(id),
  relation_type   TEXT NOT NULL DEFAULT 'friend',
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_a ON friendships(user_a_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON friendships(user_b_id, status);

-- ---------------------------------------------------------------------------
-- 30. pet_album_media — unified media store for pet photos/videos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_album_media (
  id                    TEXT PRIMARY KEY,
  pet_id                TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  source_type           TEXT NOT NULL,
  source_id             TEXT,
  booking_id            TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  media_type            TEXT NOT NULL DEFAULT 'image',
  media_url             TEXT NOT NULL,
  thumbnail_url         TEXT,
  caption               TEXT,
  tags                  TEXT NOT NULL DEFAULT '[]',
  uploaded_by_user_id   TEXT NOT NULL REFERENCES users(id),
  visibility_scope      TEXT NOT NULL DEFAULT 'private',
  is_primary            BOOLEAN NOT NULL DEFAULT false,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_album_pet_created       ON pet_album_media(pet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_album_source            ON pet_album_media(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_pet_album_media_type        ON pet_album_media(media_type);
CREATE INDEX IF NOT EXISTS idx_pet_album_visibility        ON pet_album_media(visibility_scope);
CREATE INDEX IF NOT EXISTS idx_pet_album_status            ON pet_album_media(status);
CREATE INDEX IF NOT EXISTS idx_pet_album_booking           ON pet_album_media(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_album_unique_source_media
  ON pet_album_media(pet_id, source_type, source_id, media_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_album_primary_per_pet
  ON pet_album_media(pet_id)
  WHERE is_primary = true AND status = 'active';

-- ---------------------------------------------------------------------------
-- 31. pet_weight_logs — weight time-series
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_weight_logs (
  id                  TEXT PRIMARY KEY,
  pet_id              TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_value        DOUBLE PRECISION NOT NULL,
  weight_unit_id      TEXT REFERENCES master_items(id),
  measured_at         TIMESTAMPTZ NOT NULL,
  recorded_by_user_id TEXT NOT NULL REFERENCES users(id),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_weight_logs_pet_measured ON pet_weight_logs(pet_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_weight_logs_recorded_by  ON pet_weight_logs(recorded_by_user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 32. disease_judgement_rules — threshold-based health judgement
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disease_judgement_rules (
  id                    TEXT PRIMARY KEY,
  disease_item_id       TEXT NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  measurement_item_id   TEXT NOT NULL REFERENCES master_items(id) ON DELETE CASCADE,
  context_item_id       TEXT REFERENCES master_items(id),
  species_item_id       TEXT REFERENCES master_items(id),
  min_value             DOUBLE PRECISION,
  max_value             DOUBLE PRECISION,
  unit_item_id          TEXT NOT NULL REFERENCES master_items(id),
  judgement_level       TEXT NOT NULL,
  judgement_label       TEXT,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_djr_disease_measure
  ON disease_judgement_rules(disease_item_id, measurement_item_id, context_item_id);

-- ---------------------------------------------------------------------------
-- 33. pet_disease_histories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_disease_histories (
  id                      TEXT PRIMARY KEY,
  pet_id                  TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_group_item_id   TEXT REFERENCES master_items(id),
  disease_item_id         TEXT NOT NULL REFERENCES master_items(id),
  diagnosed_at            TIMESTAMPTZ,
  notes                   TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdh_pet_active ON pet_disease_histories(pet_id, is_active);

-- ---------------------------------------------------------------------------
-- 34. pet_disease_devices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_disease_devices (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id   TEXT NOT NULL REFERENCES master_items(id),
  device_item_id    TEXT NOT NULL REFERENCES master_items(id),
  serial_number     TEXT,
  nickname          TEXT,
  notes             TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pdd_pet_disease
  ON pet_disease_devices(pet_id, disease_item_id, is_active);

-- ---------------------------------------------------------------------------
-- 35. pet_glucose_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_glucose_logs (
  id                         TEXT PRIMARY KEY,
  pet_id                     TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id            TEXT NOT NULL REFERENCES master_items(id),
  device_item_id             TEXT REFERENCES pet_disease_devices(id),
  glucose_value              DOUBLE PRECISION NOT NULL,
  glucose_unit_item_id       TEXT NOT NULL REFERENCES master_items(id),
  measured_at                TIMESTAMPTZ NOT NULL,
  measured_context_item_id   TEXT REFERENCES master_items(id),
  notes                      TEXT,
  recorded_by_user_id        TEXT NOT NULL REFERENCES users(id),
  judgement_level             TEXT,
  judgement_label             TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pgl_pet_measured ON pet_glucose_logs(pet_id, measured_at DESC);

-- ---------------------------------------------------------------------------
-- 36. pet_allergies — multi-select relation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_allergies (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  allergy_item_id   TEXT NOT NULL REFERENCES master_items(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pet_id, allergy_item_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_allergies_pet ON pet_allergies(pet_id);

-- ---------------------------------------------------------------------------
-- 37. pet_symptoms — multi-select relation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_symptoms (
  id                TEXT PRIMARY KEY,
  pet_id            TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  symptom_item_id   TEXT NOT NULL REFERENCES master_items(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pet_id, symptom_item_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_symptoms_pet ON pet_symptoms(pet_id);

-- ---------------------------------------------------------------------------
-- 38. pet_vaccinations — multi-select relation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id                  TEXT PRIMARY KEY,
  pet_id              TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccination_item_id TEXT NOT NULL REFERENCES master_items(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pet_id, vaccination_item_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_vaccinations_pet ON pet_vaccinations(pet_id);

-- ---------------------------------------------------------------------------
-- 39. device_manufacturers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_manufacturers (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name_ko     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  name_key    TEXT,
  country     TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_manufacturers_name_key
  ON device_manufacturers(name_key);

-- ---------------------------------------------------------------------------
-- 40. device_brands
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_brands (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  name_ko          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  name_key         TEXT,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_brands_name_key
  ON device_brands(name_key);

-- ---------------------------------------------------------------------------
-- 41. device_models
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_models (
  id                  TEXT PRIMARY KEY,
  device_type_id      TEXT NOT NULL REFERENCES device_types(id),
  manufacturer_id     TEXT NOT NULL REFERENCES device_manufacturers(id),
  brand_id            TEXT REFERENCES device_brands(id),
  device_type_item_id TEXT REFERENCES master_items(id),
  model_name          TEXT NOT NULL,
  model_code          TEXT,
  name_key            TEXT,
  description         TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_models_type_item
  ON device_models(device_type_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_models_name_key
  ON device_models(name_key);

-- ---------------------------------------------------------------------------
-- 42. guardian_devices — per-pet registered devices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guardian_devices (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  device_model_id  TEXT NOT NULL REFERENCES device_models(id),
  disease_item_id  TEXT REFERENCES master_items(id),
  nickname         TEXT,
  serial_number    TEXT,
  start_date       TEXT,
  notes            TEXT,
  is_default       BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guardian_devices_pet ON guardian_devices(pet_id, status);

-- ---------------------------------------------------------------------------
-- 43. measurement_units — physical measurement units
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurement_units (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  symbol      TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 44. measurement_ranges — normal/warning/danger thresholds
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS measurement_ranges (
  id                    TEXT PRIMARY KEY,
  measurement_item_id   TEXT NOT NULL REFERENCES master_items(id),
  species               TEXT,
  min_value             DOUBLE PRECISION,
  max_value             DOUBLE PRECISION,
  unit_id               TEXT NOT NULL REFERENCES measurement_units(id),
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 45. pet_health_measurement_logs — generic health measurements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_health_measurement_logs (
  id                      TEXT PRIMARY KEY,
  pet_id                  TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  disease_item_id         TEXT NOT NULL REFERENCES master_items(id),
  device_type_item_id     TEXT REFERENCES master_items(id),
  device_model_id         TEXT,
  guardian_device_id      TEXT REFERENCES guardian_devices(id),
  measurement_item_id     TEXT NOT NULL REFERENCES master_items(id),
  measurement_context_id  TEXT REFERENCES master_items(id),
  value                   DOUBLE PRECISION NOT NULL,
  unit_item_id            TEXT REFERENCES master_items(id),
  measured_at             TIMESTAMPTZ NOT NULL,
  memo                    TEXT,
  recorded_by_user_id     TEXT NOT NULL REFERENCES users(id),
  judgement_level          TEXT,
  judgement_label          TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_hml_pet_measured
  ON pet_health_measurement_logs(pet_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_hml_measurement
  ON pet_health_measurement_logs(measurement_item_id, measured_at DESC);

-- ---------------------------------------------------------------------------
-- 46. logs — health log entries (S7)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
  id            TEXT PRIMARY KEY,
  pet_id        TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  author_id     TEXT NOT NULL,
  logtype_id    TEXT NOT NULL REFERENCES master_items(id),
  event_date    TEXT NOT NULL,
  event_time    TEXT,
  title         TEXT,
  notes         TEXT,
  metadata      TEXT NOT NULL DEFAULT '{}',
  is_synced     BOOLEAN NOT NULL DEFAULT true,
  sync_version  INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_pet_date    ON logs(pet_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_logs_pet_logtype ON logs(pet_id, logtype_id);
CREATE INDEX IF NOT EXISTS idx_logs_author      ON logs(author_id);

-- ---------------------------------------------------------------------------
-- 47. log_values — metric values within a log entry
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_values (
  id             TEXT PRIMARY KEY,
  log_id         TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  metric_id      TEXT NOT NULL REFERENCES master_items(id),
  unit_id        TEXT NOT NULL REFERENCES master_items(id),
  numeric_value  DOUBLE PRECISION,
  text_value     TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_log_values_log ON log_values(log_id);

-- ---------------------------------------------------------------------------
-- 48. log_media — media attachments for log entries
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_media (
  id             TEXT PRIMARY KEY,
  log_id         TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  media_url      TEXT NOT NULL,
  media_type     TEXT NOT NULL DEFAULT 'image',
  thumbnail_url  TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_log_media_log ON log_media(log_id);

-- ---------------------------------------------------------------------------
-- 49. feed_manufacturers — feed (food) catalog manufacturers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_manufacturers (
  id             TEXT PRIMARY KEY,
  key            TEXT UNIQUE NOT NULL,
  name_key       TEXT UNIQUE,
  name_ko        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  country        TEXT,
  status         TEXT NOT NULL DEFAULT 'active',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 50. feed_brands
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_brands (
  id              TEXT PRIMARY KEY,
  manufacturer_id TEXT NOT NULL REFERENCES feed_manufacturers(id),
  name_key        TEXT UNIQUE,
  name_ko         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 51. feed_models — individual feed products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_models (
  id                 TEXT PRIMARY KEY,
  feed_type_item_id  TEXT NOT NULL REFERENCES master_items(id),
  manufacturer_id    TEXT NOT NULL REFERENCES feed_manufacturers(id),
  brand_id           TEXT REFERENCES feed_brands(id),
  name_key           TEXT UNIQUE,
  model_name         TEXT NOT NULL,
  model_code         TEXT,
  description        TEXT,
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_models_type_item ON feed_models(feed_type_item_id);
CREATE INDEX IF NOT EXISTS idx_feed_models_mfr       ON feed_models(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_feed_models_brand     ON feed_models(brand_id);

-- ---------------------------------------------------------------------------
-- 52. device_manufacturer_type_map — multi-parent mapping
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_manufacturer_type_map (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  type_item_id     TEXT NOT NULL REFERENCES master_items(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(manufacturer_id, type_item_id)
);

-- ---------------------------------------------------------------------------
-- 53. device_brand_manufacturer_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_brand_manufacturer_map (
  id               TEXT PRIMARY KEY,
  brand_id         TEXT NOT NULL REFERENCES device_brands(id),
  manufacturer_id  TEXT NOT NULL REFERENCES device_manufacturers(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, manufacturer_id)
);

-- ---------------------------------------------------------------------------
-- 54. device_model_brand_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_model_brand_map (
  id         TEXT PRIMARY KEY,
  model_id   TEXT NOT NULL REFERENCES device_models(id),
  brand_id   TEXT NOT NULL REFERENCES device_brands(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, brand_id)
);

-- ---------------------------------------------------------------------------
-- 55. feed_manufacturer_type_map — multi-parent mapping
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_manufacturer_type_map (
  id               TEXT PRIMARY KEY,
  manufacturer_id  TEXT NOT NULL REFERENCES feed_manufacturers(id),
  type_item_id     TEXT NOT NULL REFERENCES master_items(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(manufacturer_id, type_item_id)
);

-- ---------------------------------------------------------------------------
-- 56. feed_brand_manufacturer_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_brand_manufacturer_map (
  id               TEXT PRIMARY KEY,
  brand_id         TEXT NOT NULL REFERENCES feed_brands(id),
  manufacturer_id  TEXT NOT NULL REFERENCES feed_manufacturers(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(brand_id, manufacturer_id)
);

-- ---------------------------------------------------------------------------
-- 57. feed_model_brand_map
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_model_brand_map (
  id         TEXT PRIMARY KEY,
  model_id   TEXT NOT NULL REFERENCES feed_models(id),
  brand_id   TEXT NOT NULL REFERENCES feed_brands(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, brand_id)
);

-- ---------------------------------------------------------------------------
-- 58. pet_feeds — per-pet feed registrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_feeds (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  feed_model_id    TEXT NOT NULL REFERENCES feed_models(id),
  disease_item_id  TEXT REFERENCES master_items(id),
  nickname         TEXT,
  daily_amount_g   DOUBLE PRECISION,
  daily_amount_unit TEXT DEFAULT 'g',
  feeding_frequency INTEGER,
  start_date       TEXT,
  end_date         TEXT,
  notes            TEXT,
  is_primary       BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 59. feed_nutrition — per feed-model nutritional info
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_nutrition (
  id                TEXT PRIMARY KEY,
  feed_model_id     TEXT NOT NULL REFERENCES feed_models(id) ON DELETE CASCADE,
  calories_per_100g DOUBLE PRECISION,
  protein_pct       DOUBLE PRECISION,
  fat_pct           DOUBLE PRECISION,
  fiber_pct         DOUBLE PRECISION,
  moisture_pct      DOUBLE PRECISION,
  ash_pct           DOUBLE PRECISION,
  calcium_pct       DOUBLE PRECISION,
  phosphorus_pct    DOUBLE PRECISION,
  omega3_pct        DOUBLE PRECISION,
  omega6_pct        DOUBLE PRECISION,
  carbohydrate_pct  DOUBLE PRECISION,
  serving_size_g    DOUBLE PRECISION,
  ingredients_text  TEXT,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(feed_model_id)
);

-- ---------------------------------------------------------------------------
-- 60. pet_feeding_logs — daily feeding records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_feeding_logs (
  id               TEXT PRIMARY KEY,
  pet_id           TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  pet_feed_id      TEXT REFERENCES pet_feeds(id),
  feed_model_id    TEXT REFERENCES feed_models(id),
  amount_g         DOUBLE PRECISION,
  amount_unit      TEXT DEFAULT 'g',
  frequency        INTEGER,
  feeding_time     TEXT,
  memo             TEXT,
  is_mixed         BOOLEAN DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pet_feeding_logs_pet ON pet_feeding_logs(pet_id, status);

-- ---------------------------------------------------------------------------
-- 61. pet_feeding_log_items — individual items in a mixed feeding log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_feeding_log_items (
  id              TEXT PRIMARY KEY,
  feeding_log_id  TEXT NOT NULL REFERENCES pet_feeding_logs(id) ON DELETE CASCADE,
  pet_feed_id     TEXT REFERENCES pet_feeds(id),
  feed_model_id   TEXT REFERENCES feed_models(id),
  amount_g        DOUBLE PRECISION,
  ratio_pct       DOUBLE PRECISION,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feeding_log_items_log ON pet_feeding_log_items(feeding_log_id);

-- ---------------------------------------------------------------------------
-- 62. feeding_mix_favorites — saved mixed-feed combinations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feeding_mix_favorites (
  id         TEXT PRIMARY KEY,
  pet_id     TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  status     TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fmf_pet ON feeding_mix_favorites(pet_id, status);

-- ---------------------------------------------------------------------------
-- 63. feed_registration_requests — guardian-initiated feed requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_registration_requests (
  id                      TEXT PRIMARY KEY,
  requester_user_id       TEXT NOT NULL,
  pet_id                  TEXT,
  feed_name               TEXT NOT NULL,
  feed_type_item_id       TEXT,
  manufacturer_name       TEXT,
  brand_name              TEXT,
  calories_per_100g       DOUBLE PRECISION,
  protein_pct             DOUBLE PRECISION,
  fat_pct                 DOUBLE PRECISION,
  fiber_pct               DOUBLE PRECISION,
  moisture_pct            DOUBLE PRECISION,
  ash_pct                 DOUBLE PRECISION,
  calcium_pct             DOUBLE PRECISION,
  phosphorus_pct          DOUBLE PRECISION,
  omega3_pct              DOUBLE PRECISION,
  omega6_pct              DOUBLE PRECISION,
  carbohydrate_pct        DOUBLE PRECISION,
  serving_size_g          DOUBLE PRECISION,
  ingredients_text        TEXT,
  reference_url           TEXT,
  memo                    TEXT,
  status                  TEXT NOT NULL DEFAULT 'pending',
  reviewed_by_user_id     TEXT,
  review_note             TEXT,
  reviewed_at             TIMESTAMPTZ,
  approved_manufacturer_id TEXT,
  approved_brand_id       TEXT,
  approved_model_id       TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feed_reg_req_requester ON feed_registration_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_feed_reg_req_status    ON feed_registration_requests(status);

-- ---------------------------------------------------------------------------
-- 64. feed_nutrient_types — catalog of nutrient types
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_nutrient_types (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 65. feed_nutrition_units — units for nutrition values
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_nutrition_units (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  symbol       TEXT,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 66. feed_nutrition_basis_types — basis for nutrition calculations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_nutrition_basis_types (
  id           TEXT PRIMARY KEY,
  key          TEXT UNIQUE NOT NULL,
  name_key     TEXT UNIQUE,
  name_ko      TEXT NOT NULL,
  name_en      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'active',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- 67. feed_model_nutrients — per-model nutrient values
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_model_nutrients (
  id               TEXT PRIMARY KEY,
  model_id         TEXT NOT NULL REFERENCES feed_models(id),
  nutrient_type_id TEXT NOT NULL REFERENCES feed_nutrient_types(id),
  basis_type_id    TEXT NOT NULL REFERENCES feed_nutrition_basis_types(id),
  value            DOUBLE PRECISION NOT NULL,
  unit_id          TEXT NOT NULL REFERENCES feed_nutrition_units(id),
  source_note      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, nutrient_type_id, basis_type_id, unit_id)
);

CREATE INDEX IF NOT EXISTS idx_feed_model_nutrients_model    ON feed_model_nutrients(model_id);
CREATE INDEX IF NOT EXISTS idx_feed_model_nutrients_nutrient ON feed_model_nutrients(nutrient_type_id);

-- ---------------------------------------------------------------------------
-- 68. user_account_details — extended member account info
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_account_details (
  id                        TEXT PRIMARY KEY,
  user_id                   TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name                 TEXT,
  nickname                  TEXT,
  phone                     TEXT,
  address_line              TEXT,
  address_place_id          TEXT,
  address_lat               DOUBLE PRECISION,
  address_lng               DOUBLE PRECISION,
  region_text               TEXT,
  preferred_language         TEXT,
  has_pets                  BOOLEAN NOT NULL DEFAULT false,
  pet_count                 INTEGER NOT NULL DEFAULT 0,
  interested_pet_types      TEXT NOT NULL DEFAULT '[]',
  favorite_provider_user_id TEXT REFERENCES users(id),
  notifications_booking     BOOLEAN NOT NULL DEFAULT true,
  notifications_health      BOOLEAN NOT NULL DEFAULT true,
  marketing_opt_in          BOOLEAN NOT NULL DEFAULT false,
  terms_agreed_at           TIMESTAMPTZ,
  public_profile            BOOLEAN NOT NULL DEFAULT false,
  public_id                 TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_account_details_user
  ON user_account_details(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_account_details_public_id
  ON user_account_details(public_id);

-- ---------------------------------------------------------------------------
-- 69. provider_profiles — provider business profile
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_profiles (
  id                       TEXT PRIMARY KEY,
  user_id                  TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_category_l1_id  TEXT REFERENCES master_items(id),
  business_category_l2_id  TEXT REFERENCES master_items(id),
  business_category_l3_id  TEXT REFERENCES master_items(id),
  pet_type_l1_id           TEXT REFERENCES master_items(id),
  pet_type_l2_id           TEXT REFERENCES master_items(id),
  business_registration_no TEXT,
  operating_hours          TEXT,
  supported_pet_types      TEXT NOT NULL DEFAULT '[]',
  certifications           TEXT NOT NULL DEFAULT '[]',
  address_line             TEXT,
  address_place_id         TEXT,
  address_lat              DOUBLE PRECISION,
  address_lng              DOUBLE PRECISION,
  approval_status          TEXT NOT NULL DEFAULT 'pending',
  approved_at              TIMESTAMPTZ,
  approved_by_user_id      TEXT REFERENCES users(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_l1
  ON provider_profiles(business_category_l1_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_status
  ON provider_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_business_l3
  ON provider_profiles(business_category_l3_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_pet_l1
  ON provider_profiles(pet_type_l1_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_pet_l2
  ON provider_profiles(pet_type_l2_id);

-- ---------------------------------------------------------------------------
-- 70. role_applications — role upgrade requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_applications (
  id                       TEXT PRIMARY KEY,
  user_id                  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role           TEXT NOT NULL,
  business_category_l1_id  TEXT REFERENCES master_items(id),
  business_category_l2_id  TEXT REFERENCES master_items(id),
  business_category_l3_id  TEXT REFERENCES master_items(id),
  pet_type_l1_id           TEXT REFERENCES master_items(id),
  pet_type_l2_id           TEXT REFERENCES master_items(id),
  status                   TEXT NOT NULL DEFAULT 'pending',
  rejection_reason         TEXT,
  requested_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at               TIMESTAMPTZ,
  decided_by_user_id       TEXT REFERENCES users(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_applications_user
  ON role_applications(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_applications_status
  ON role_applications(status, requested_role);
CREATE INDEX IF NOT EXISTS idx_role_applications_business_l3
  ON role_applications(business_category_l3_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_pet_l1
  ON role_applications(pet_type_l1_id);
CREATE INDEX IF NOT EXISTS idx_role_applications_pet_l2
  ON role_applications(pet_type_l2_id);

-- ---------------------------------------------------------------------------
-- 71. platform_settings — global platform configuration
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
  id                 TEXT PRIMARY KEY,
  setting_key        TEXT NOT NULL UNIQUE,
  setting_value      TEXT NOT NULL DEFAULT '',
  description        TEXT,
  updated_by_user_id TEXT REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------
-- Record consolidated migration
-- ---------------------------------------------------------------------------
INSERT INTO schema_migrations (version)
VALUES ('pg_001_init')
ON CONFLICT DO NOTHING;
