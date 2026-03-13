-- =============================================================================
-- 007_booking_system_v2.sql — Booking system enhancements
-- =============================================================================
-- Adds: overtime settings, review system, enhanced appointments/grooming
-- All statements idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. stores — overtime & review settings (was 'suppliers' in design doc)
-- ---------------------------------------------------------------------------
ALTER TABLE stores ADD COLUMN IF NOT EXISTS allow_overtime BOOLEAN DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS overtime_fee_type TEXT DEFAULT 'free';
  -- 'free' | 'fixed' | 'per_30min'
ALTER TABLE stores ADD COLUMN IF NOT EXISTS overtime_fee_amount INTEGER DEFAULT 0;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS review_public BOOLEAN DEFAULT false;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';
  -- { "mon": { "open": "09:00", "close": "18:00" }, ... }

-- ---------------------------------------------------------------------------
-- 2. services — add duration_minutes for slot calculation
-- ---------------------------------------------------------------------------
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- ---------------------------------------------------------------------------
-- 3. appointments — enhanced booking fields
-- ---------------------------------------------------------------------------
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS business_type TEXT;
  -- grooming / vet / training / petshop / hotel / petcafe / photo
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS extra_data JSONB DEFAULT '{}';
  -- business-type-specific additional input
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_report_period TEXT;
  -- '1d' | '7d' | '15d' | '1m' | null
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS pet_report_sent BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN DEFAULT false;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER DEFAULT 0;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS overtime_fee INTEGER DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 4. grooming_records — enhanced completion fields
-- ---------------------------------------------------------------------------
ALTER TABLE grooming_records ADD COLUMN IF NOT EXISTS cut_style_item_id TEXT REFERENCES master_items(id);
  -- L3 cut style from master_items hierarchy
ALTER TABLE grooming_records ADD COLUMN IF NOT EXISTS custom_cut_name TEXT;
ALTER TABLE grooming_records ADD COLUMN IF NOT EXISTS memo TEXT;
  -- memo visible to guardian (separate from supplier_comment)
ALTER TABLE grooming_records ADD COLUMN IF NOT EXISTS report_sent_at TIMESTAMPTZ;
ALTER TABLE grooming_records ADD COLUMN IF NOT EXISTS guardian_choice_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- 5. appointment_reviews — new table (1 guardian + 1 supplier per appointment)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointment_reviews (
  id              TEXT PRIMARY KEY,
  appointment_id  TEXT NOT NULL REFERENCES appointments(id),
  store_id        TEXT REFERENCES stores(id),
  author_user_id  TEXT NOT NULL REFERENCES users(id),
  pet_id          TEXT REFERENCES pets(id),

  author_type     TEXT NOT NULL,
  -- 'guardian' : guardian reviews supplier
  -- 'supplier' : supplier reviews guardian/pet

  rating          NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  -- 0.5 increments (1.0 ~ 5.0)

  content         TEXT,
  is_visible      BOOLEAN DEFAULT true,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (appointment_id, author_type)
);

CREATE INDEX IF NOT EXISTS idx_reviews_appointment
  ON appointment_reviews(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_store
  ON appointment_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author_type
  ON appointment_reviews(author_type);

-- ---------------------------------------------------------------------------
-- 6. booking_completion_contents — missing table referenced by bookings.ts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_completion_contents (
  id              TEXT PRIMARY KEY,
  booking_id      TEXT NOT NULL UNIQUE REFERENCES bookings(id),
  supplier_id     TEXT NOT NULL REFERENCES users(id),
  media_urls      JSONB NOT NULL DEFAULT '[]',
  completion_memo TEXT,
  publish_status  TEXT NOT NULL DEFAULT 'pending',
  requested_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_completion_booking
  ON booking_completion_contents(booking_id);

-- ---------------------------------------------------------------------------
-- Record migration
-- ---------------------------------------------------------------------------
INSERT INTO schema_migrations (version)
VALUES ('007_booking_system_v2')
ON CONFLICT (version) DO NOTHING;
