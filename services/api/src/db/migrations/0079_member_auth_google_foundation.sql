CREATE TABLE IF NOT EXISTS user_account_details (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  nickname TEXT,
  phone TEXT,
  address_line TEXT,
  address_place_id TEXT,
  address_lat REAL,
  address_lng REAL,
  region_text TEXT,
  preferred_language TEXT,
  has_pets INTEGER NOT NULL DEFAULT 0,
  pet_count INTEGER NOT NULL DEFAULT 0,
  interested_pet_types TEXT NOT NULL DEFAULT '[]',
  favorite_provider_user_id TEXT REFERENCES users(id),
  notifications_booking INTEGER NOT NULL DEFAULT 1,
  notifications_health INTEGER NOT NULL DEFAULT 1,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  terms_agreed_at TEXT,
  public_profile INTEGER NOT NULL DEFAULT 0,
  public_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_user_account_details_user ON user_account_details(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_account_details_public_id ON user_account_details(public_id);

CREATE TABLE IF NOT EXISTS provider_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_category_l1_id TEXT REFERENCES master_items(id),
  business_category_l2_id TEXT REFERENCES master_items(id),
  business_registration_no TEXT,
  operating_hours TEXT,
  supported_pet_types TEXT NOT NULL DEFAULT '[]',
  certifications TEXT NOT NULL DEFAULT '[]',
  address_line TEXT,
  address_place_id TEXT,
  address_lat REAL,
  address_lng REAL,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_at TEXT,
  approved_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_l1 ON provider_profiles(business_category_l1_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_status ON provider_profiles(approval_status);

CREATE TABLE IF NOT EXISTS role_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL,
  business_category_l1_id TEXT REFERENCES master_items(id),
  business_category_l2_id TEXT REFERENCES master_items(id),
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  requested_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT,
  decided_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_role_applications_user ON role_applications(user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_applications_status ON role_applications(status, requested_role);

CREATE TABLE IF NOT EXISTS platform_settings (
  id TEXT PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_by_user_id TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO platform_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES
  (lower(hex(randomblob(16))), 'google_places_api_key', '', 'Google Places API key', datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'google_oauth_client_id', '', 'Google OAuth client id', datetime('now'), datetime('now')),
  (lower(hex(randomblob(16))), 'google_oauth_redirect_uri', '', 'Google OAuth redirect uri', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0079_member_auth_google_foundation');
