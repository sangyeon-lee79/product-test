-- Migration 0016: Feed + Friendship + Booking completion publish workflow core

-- Booking core (S10 minimal)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  guardian_id TEXT NOT NULL REFERENCES users(id),
  supplier_id TEXT NOT NULL REFERENCES users(id),
  pet_id TEXT REFERENCES pets(id),
  service_id TEXT,
  business_category_id TEXT REFERENCES master_items(id),
  status TEXT NOT NULL DEFAULT 'created', -- created|in_progress|service_completed|publish_requested|publish_approved|publish_rejected|cancelled
  requested_date TEXT,
  requested_time TEXT,
  notes TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_guardian ON bookings(guardian_id);
CREATE INDEX IF NOT EXISTS idx_bookings_supplier ON bookings(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE TABLE IF NOT EXISTS booking_completion_contents (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL REFERENCES users(id),
  media_urls TEXT NOT NULL DEFAULT '[]',
  completion_memo TEXT,
  publish_status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  responded_at TEXT,
  responded_by_guardian_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Feed core
CREATE TABLE IF NOT EXISTS feeds (
  id TEXT PRIMARY KEY,
  feed_type TEXT NOT NULL, -- guardian_post|booking_completed|health_update|supplier_story|pet_milestone
  author_user_id TEXT NOT NULL REFERENCES users(id),
  author_role TEXT NOT NULL, -- guardian|provider|admin
  pet_id TEXT REFERENCES pets(id),
  business_category_id TEXT REFERENCES master_items(id),
  pet_type_id TEXT REFERENCES master_items(id),
  visibility_scope TEXT NOT NULL DEFAULT 'public', -- public|friends_only|private|connected_only|booking_related_only
  booking_id TEXT REFERENCES bookings(id),
  supplier_id TEXT REFERENCES users(id),
  related_service_id TEXT,
  caption TEXT,
  media_urls TEXT NOT NULL DEFAULT '[]',
  tags TEXT NOT NULL DEFAULT '[]',
  publish_request_status TEXT NOT NULL DEFAULT 'none', -- none|pending|approved|rejected
  is_public INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft|published|hidden|deleted
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feeds_created_at ON feeds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feeds_type ON feeds(feed_type);
CREATE INDEX IF NOT EXISTS idx_feeds_business ON feeds(business_category_id);
CREATE INDEX IF NOT EXISTS idx_feeds_pet_type ON feeds(pet_type_id);
CREATE INDEX IF NOT EXISTS idx_feeds_status ON feeds(status, is_public);

CREATE TABLE IF NOT EXISTS feed_likes (
  id TEXT PRIMARY KEY,
  feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(feed_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_feed_likes_feed ON feed_likes(feed_id);

CREATE TABLE IF NOT EXISTS feed_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL REFERENCES users(id),
  parent_comment_id TEXT REFERENCES feed_comments(id),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active|deleted
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id, created_at);

-- Friendship core
CREATE TABLE IF NOT EXISTS friend_requests (
  id TEXT PRIMARY KEY,
  requester_user_id TEXT NOT NULL REFERENCES users(id),
  receiver_user_id TEXT NOT NULL REFERENCES users(id),
  requester_role TEXT NOT NULL,
  receiver_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'request_sent', -- request_sent|accepted|rejected|blocked
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  responded_at TEXT,
  UNIQUE(requester_user_id, receiver_user_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_a_id TEXT NOT NULL REFERENCES users(id),
  user_b_id TEXT NOT NULL REFERENCES users(id),
  relation_type TEXT NOT NULL DEFAULT 'friend', -- friend|guardian_supplier_connected
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_a_id, user_b_id)
);
CREATE INDEX IF NOT EXISTS idx_friendships_user_a ON friendships(user_a_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_b ON friendships(user_b_id, status);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0016_feed_friendship_booking_core');
