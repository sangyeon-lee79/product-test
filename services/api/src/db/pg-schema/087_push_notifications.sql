-- 087_push_notifications.sql
-- Push notification infrastructure: FCM tokens, notification settings, notifications table extensions

-- user_push_tokens: FCM token storage per user/device
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'web',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_tokens_token ON user_push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON user_push_tokens(user_id, is_active);

-- Extend notifications table with push-related columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_sent BOOLEAN NOT NULL DEFAULT false;

-- notification_settings: per-user notification preferences
CREATE TABLE IF NOT EXISTS notification_settings (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  friend_request     BOOLEAN NOT NULL DEFAULT true,
  friend_accepted    BOOLEAN NOT NULL DEFAULT true,
  post_like          BOOLEAN NOT NULL DEFAULT true,
  post_comment       BOOLEAN NOT NULL DEFAULT true,
  friend_new_post    BOOLEAN NOT NULL DEFAULT true,
  pet_health_remind  BOOLEAN NOT NULL DEFAULT true,
  appointment_remind BOOLEAN NOT NULL DEFAULT true,
  service_notice     BOOLEAN NOT NULL DEFAULT true,
  marketing          BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed FCM credentials into platform_settings (empty values, configured via Admin UI)
INSERT INTO platform_settings (id, setting_key, setting_value, description)
VALUES
  (gen_random_uuid()::text, 'fcm_project_id', '', 'Firebase project ID'),
  (gen_random_uuid()::text, 'fcm_service_account_email', '', 'FCM service account email'),
  (gen_random_uuid()::text, 'fcm_service_account_private_key', '', 'FCM service account private key')
ON CONFLICT (setting_key) DO NOTHING;
