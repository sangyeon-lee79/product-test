-- Migration 0021: Petfolio Core Alignment
-- Aligning DB schema with Petfolio's pet-centric SNS architecture and master data requirements.

-- 1. master_categories refactoring
CREATE TABLE master_categories_new (
    id          TEXT PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    name        TEXT,
    description TEXT,
    parent_id   TEXT REFERENCES master_categories_new(id),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'active', -- map from is_active (1=active, 0=inactive)
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO master_categories_new (id, code, sort_order, status, created_at, updated_at)
SELECT id, key, sort_order, CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END, created_at, updated_at
FROM master_categories;

-- 2. master_items refactoring
CREATE TABLE master_items_new (
    id              TEXT PRIMARY KEY,
    category_id     TEXT NOT NULL REFERENCES master_categories_new(id),
    parent_item_id  TEXT REFERENCES master_items_new(id),
    code            TEXT NOT NULL,
    name            TEXT,
    description     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'active',
    metadata        TEXT NOT NULL DEFAULT '{}',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(category_id, code)
);

INSERT INTO master_items_new (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT id, category_id, parent_id, key, sort_order, CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END, metadata, created_at, updated_at
FROM master_items;

-- 3. pets refactoring (adding missing fields)
CREATE TABLE pets_new (
    id                  TEXT PRIMARY KEY,
    guardian_user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    microchip_number    TEXT,
    pet_type_id         TEXT REFERENCES master_items_new(id),
    breed_id            TEXT REFERENCES master_items_new(id),
    gender_id           TEXT REFERENCES master_items_new(id),
    life_stage_id       TEXT REFERENCES master_items_new(id),
    body_size_id        TEXT REFERENCES master_items_new(id),
    country_id          TEXT REFERENCES countries(id),
    diet_type_id        TEXT REFERENCES master_items_new(id),
    coat_length_id      TEXT REFERENCES master_items_new(id),
    coat_type_id        TEXT REFERENCES master_items_new(id),
    activity_level_id   TEXT REFERENCES master_items_new(id),
    health_level_id     TEXT REFERENCES master_items_new(id),
    gender_legacy       TEXT, -- backup for existing gender column ('male'|'female')
    species_legacy      TEXT, -- backup for existing species column ('dog'|'cat')
    birth_date          TEXT,
    weight_kg           REAL,
    is_neutered         INTEGER NOT NULL DEFAULT 0,
    avatar_url          TEXT,
    status              TEXT NOT NULL DEFAULT 'active',
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);

INSERT INTO pets_new (
    id, guardian_user_id, name, microchip_number, breed_id, gender_legacy, species_legacy, birth_date, weight_kg, is_neutered, avatar_url, status, created_at, updated_at
)
SELECT 
    id, guardian_id, name, microchip_no, breed_id, gender, species, birth_date, weight_kg, is_neutered, avatar_url, status, created_at, updated_at
FROM pets;

-- 4. feed_posts (Unified feed)
CREATE TABLE feed_posts (
    id                  TEXT PRIMARY KEY,
    author_user_id      TEXT NOT NULL REFERENCES users(id),
    author_role         TEXT NOT NULL, -- guardian|provider|admin
    feed_type           TEXT NOT NULL, -- guardian_post|booking_completed|health_update|supplier_story|pet_milestone
    visibility_scope    TEXT NOT NULL DEFAULT 'public', -- public|friends_only|private
    caption             TEXT,
    status              TEXT NOT NULL DEFAULT 'published', -- published|hidden|deleted
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Migrate existing feeds to feed_posts if any
INSERT INTO feed_posts (id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at)
SELECT id, author_user_id, author_role, feed_type, visibility_scope, caption, status, created_at, updated_at
FROM feeds;

-- 5. feed_post_pets (Mapping)
CREATE TABLE feed_post_pets (
    id          TEXT PRIMARY KEY,
    post_id     TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    pet_id      TEXT NOT NULL REFERENCES pets_new(id) ON DELETE CASCADE,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Migrate existing feed-pet relation
INSERT INTO feed_post_pets (id, post_id, pet_id, sort_order)
SELECT 'fpp-' || id, id, pet_id, 0
FROM feeds WHERE pet_id IS NOT NULL;

-- 6. feed_media
CREATE TABLE feed_media (
    id              TEXT PRIMARY KEY,
    post_id         TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    media_type      TEXT NOT NULL, -- image|video
    media_url       TEXT NOT NULL,
    thumbnail_url   TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

-- 7. feed_comments (Update FK to feed_posts)
CREATE TABLE feed_comments_new (
    id                  TEXT PRIMARY KEY,
    post_id             TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    author_user_id      TEXT NOT NULL REFERENCES users(id),
    parent_comment_id   TEXT REFERENCES feed_comments_new(id),
    content             TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'active',
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO feed_comments_new SELECT * FROM feed_comments;

-- 8. feed_likes (Update FK to feed_posts)
CREATE TABLE feed_likes_new (
    id          TEXT PRIMARY KEY,
    post_id     TEXT NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(post_id, user_id)
);

INSERT INTO feed_likes_new SELECT * FROM feed_likes;

-- 9. feed_publish_requests (Refactored from booking_completion_contents)
CREATE TABLE feed_publish_requests (
    id              TEXT PRIMARY KEY,
    booking_id      TEXT NOT NULL REFERENCES bookings(id),
    supplier_id     TEXT NOT NULL REFERENCES users(id),
    guardian_id     TEXT NOT NULL REFERENCES users(id),
    content         TEXT,
    media_urls      TEXT NOT NULL DEFAULT '[]', -- JSON array
    status          TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    approved_at     TEXT
);

INSERT INTO feed_publish_requests (id, booking_id, supplier_id, guardian_id, content, media_urls, status, created_at, approved_at)
SELECT 
    id, booking_id, supplier_id, responded_by_guardian_id, completion_memo, media_urls, 
    CASE WHEN publish_status = 'approved' THEN 'approved' WHEN publish_status = 'rejected' THEN 'rejected' ELSE 'pending' END,
    created_at, responded_at
FROM booking_completion_contents;

-- 10. health_records
CREATE TABLE health_records (
    id                  TEXT PRIMARY KEY,
    pet_id              TEXT NOT NULL REFERENCES pets_new(id) ON DELETE CASCADE,
    record_type         TEXT NOT NULL, -- symptom|disease|vaccination|checkup
    symptom_id          TEXT REFERENCES master_items_new(id),
    disease_id          TEXT REFERENCES master_items_new(id),
    description         TEXT,
    recorded_at         TEXT NOT NULL DEFAULT (datetime('now')),
    created_by_user_id  TEXT NOT NULL REFERENCES users(id),
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Migrate existing pet_diseases to health_records
INSERT INTO health_records (id, pet_id, record_type, disease_id, description, recorded_at, created_by_user_id, created_at)
SELECT 'hr-' || id, pet_id, 'disease', disease_id, notes, diagnosed_at, (SELECT guardian_id FROM pets WHERE pets.id = pet_diseases.pet_id), created_at
FROM pet_diseases;

-- 11. Finalizing (Drop old tables and rename new ones)
-- Order matters for FK constraints
DROP TABLE feed_likes;
DROP TABLE feed_comments;
DROP TABLE feeds;
DROP TABLE booking_completion_contents;
DROP TABLE pet_diseases;
DROP TABLE pets;
DROP TABLE master_items;
DROP TABLE master_categories;

ALTER TABLE master_categories_new RENAME TO master_categories;
ALTER TABLE master_items_new RENAME TO master_items;
ALTER TABLE pets_new RENAME TO pets;
ALTER TABLE feed_comments_new RENAME TO feed_comments;
ALTER TABLE feed_likes_new RENAME TO feed_likes;

-- Add indexes for new tables
CREATE INDEX idx_master_items_category ON master_items(category_id);
CREATE INDEX idx_master_items_parent ON master_items(parent_item_id);
CREATE INDEX idx_pets_guardian ON pets(guardian_user_id);
CREATE INDEX idx_feed_posts_author ON feed_posts(author_user_id);
CREATE INDEX idx_feed_post_pets_post ON feed_post_pets(post_id);
CREATE INDEX idx_feed_post_pets_pet ON feed_post_pets(pet_id);
CREATE INDEX idx_health_records_pet ON health_records(pet_id);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0021_petfolio_core_alignment');
