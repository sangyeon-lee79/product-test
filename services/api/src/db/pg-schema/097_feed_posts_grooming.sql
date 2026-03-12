-- 089: Extend feed_posts for grooming completion feed integration
-- Adds author_type, supplier_id, GROOMING post_type support, grooming_record_id, grooming_tags

ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS author_type TEXT NOT NULL DEFAULT 'guardian';
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS supplier_id TEXT REFERENCES users(id);
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS grooming_record_id TEXT REFERENCES grooming_records(id);
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS grooming_tags JSONB NOT NULL DEFAULT '[]';

-- post_type already exists (081_supplier_post_type.sql) with GENERAL/NEWS/PRODUCT/EVENT/HIRING
-- GROOMING will be used as a new post_type value (no enum constraint, TEXT column)
