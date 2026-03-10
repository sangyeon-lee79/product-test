-- Feed Registration Requests: guardians request new feeds, admins approve/reject
CREATE TABLE IF NOT EXISTS feed_registration_requests (
  id TEXT PRIMARY KEY,
  requester_user_id TEXT NOT NULL,
  pet_id TEXT,
  feed_name TEXT NOT NULL,
  feed_type_item_id TEXT,
  manufacturer_name TEXT,
  brand_name TEXT,
  calories_per_100g REAL,
  protein_pct REAL,
  fat_pct REAL,
  fiber_pct REAL,
  moisture_pct REAL,
  reference_url TEXT,
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by_user_id TEXT,
  review_note TEXT,
  reviewed_at TEXT,
  approved_manufacturer_id TEXT,
  approved_brand_id TEXT,
  approved_model_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_feed_reg_req_requester ON feed_registration_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_feed_reg_req_status ON feed_registration_requests(status);
