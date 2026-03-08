-- 0058_feed_manufacturer_type_map_backfill.sql
-- Backfill manufacturer <-> feed_type mapping from active feed models
-- to keep FeedPage manufacturer filtering consistent by selected feed type.

INSERT OR IGNORE INTO feed_manufacturer_type_map (
  id,
  manufacturer_id,
  type_item_id,
  created_at
)
SELECT
  lower(hex(randomblob(16))),
  fm.manufacturer_id,
  fm.feed_type_item_id,
  datetime('now')
FROM feed_models fm
WHERE fm.status = 'active'
  AND fm.manufacturer_id IS NOT NULL
  AND fm.feed_type_item_id IS NOT NULL;

INSERT OR IGNORE INTO schema_migrations (version)
VALUES ('0058_feed_manufacturer_type_map_backfill');
