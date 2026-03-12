-- 081: Add post_type column to feed_posts for supplier post categorization
-- Values: GENERAL (default), NEWS, PRODUCT, EVENT, HIRING

ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'GENERAL';
