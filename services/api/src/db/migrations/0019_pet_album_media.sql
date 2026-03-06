-- Migration 0019: Pet album unified media store

CREATE TABLE IF NOT EXISTS pet_album_media (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- profile|feed|booking_completed|health_record|manual_upload
  source_id TEXT,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  media_type TEXT NOT NULL DEFAULT 'image', -- image|video
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  uploaded_by_user_id TEXT NOT NULL REFERENCES users(id),
  visibility_scope TEXT NOT NULL DEFAULT 'private', -- public|friends_only|private|guardian_supplier_only|booking_related
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active|pending|hidden|deleted
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pet_album_pet_created ON pet_album_media(pet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_album_source ON pet_album_media(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_pet_album_media_type ON pet_album_media(media_type);
CREATE INDEX IF NOT EXISTS idx_pet_album_visibility ON pet_album_media(visibility_scope);
CREATE INDEX IF NOT EXISTS idx_pet_album_status ON pet_album_media(status);
CREATE INDEX IF NOT EXISTS idx_pet_album_booking ON pet_album_media(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_album_unique_source_media
  ON pet_album_media(pet_id, source_type, source_id, media_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pet_album_primary_per_pet
  ON pet_album_media(pet_id)
  WHERE is_primary = 1 AND status = 'active';

-- Backfill from existing feeds.media_urls
INSERT OR IGNORE INTO pet_album_media (
  id,
  pet_id,
  source_type,
  source_id,
  booking_id,
  media_type,
  media_url,
  thumbnail_url,
  caption,
  tags,
  uploaded_by_user_id,
  visibility_scope,
  is_primary,
  sort_order,
  status,
  created_at,
  updated_at
)
SELECT
  lower(hex(randomblob(16))) AS id,
  f.pet_id,
  CASE
    WHEN f.feed_type = 'booking_completed' THEN 'booking_completed'
    WHEN f.feed_type = 'health_update' THEN 'health_record'
    WHEN f.feed_type = 'pet_milestone' AND EXISTS (
      SELECT 1
      FROM json_each(CASE WHEN json_valid(f.tags) THEN f.tags ELSE '[]' END) jt
      WHERE lower(trim(CAST(jt.value AS TEXT))) = 'source:profile'
    ) THEN 'profile'
    WHEN EXISTS (
      SELECT 1
      FROM json_each(CASE WHEN json_valid(f.tags) THEN f.tags ELSE '[]' END) jt
      WHERE lower(trim(CAST(jt.value AS TEXT))) = 'source:manual_upload'
    ) THEN 'manual_upload'
    ELSE 'feed'
  END AS source_type,
  f.id AS source_id,
  f.booking_id,
  CASE
    WHEN lower(trim(CAST(j.value AS TEXT))) LIKE '%.mp4%'
      OR lower(trim(CAST(j.value AS TEXT))) LIKE '%.mov%'
      OR lower(trim(CAST(j.value AS TEXT))) LIKE '%.webm%'
      OR lower(trim(CAST(j.value AS TEXT))) LIKE '%.mkv%'
      OR lower(trim(CAST(j.value AS TEXT))) LIKE '%.avi%'
    THEN 'video'
    ELSE 'image'
  END AS media_type,
  trim(CAST(j.value AS TEXT)) AS media_url,
  trim(CAST(j.value AS TEXT)) AS thumbnail_url,
  f.caption,
  CASE WHEN json_valid(f.tags) THEN f.tags ELSE '[]' END AS tags,
  f.author_user_id,
  CASE
    WHEN f.visibility_scope = 'connected_only' THEN 'guardian_supplier_only'
    WHEN f.visibility_scope = 'booking_related_only' THEN 'booking_related'
    ELSE f.visibility_scope
  END AS visibility_scope,
  0 AS is_primary,
  j.key AS sort_order,
  CASE
    WHEN f.publish_request_status = 'pending' THEN 'pending'
    WHEN f.status = 'published' THEN 'active'
    WHEN f.status = 'hidden' THEN 'hidden'
    ELSE 'hidden'
  END AS status,
  f.created_at,
  f.updated_at
FROM feeds f
JOIN json_each(CASE WHEN json_valid(f.media_urls) THEN f.media_urls ELSE '[]' END) j
WHERE f.pet_id IS NOT NULL
  AND trim(CAST(j.value AS TEXT)) <> ''
  AND f.status != 'deleted';

-- Mark latest profile media per pet as primary
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY pet_id ORDER BY datetime(created_at) DESC, id DESC) AS rn
  FROM pet_album_media
  WHERE source_type = 'profile' AND status = 'active'
)
UPDATE pet_album_media
SET is_primary = CASE WHEN id IN (SELECT id FROM ranked WHERE rn = 1) THEN 1 ELSE 0 END,
    updated_at = datetime('now')
WHERE source_type = 'profile' AND status = 'active';

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0019_pet_album_media');
