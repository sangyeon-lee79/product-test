-- 085: Track last login provider and timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
