-- =============================================================================
-- 014: Store pet support columns (supported_pet_l1_ids, supported_pet_l2_ids)
-- =============================================================================

ALTER TABLE stores ADD COLUMN IF NOT EXISTS supported_pet_l1_ids JSONB DEFAULT '[]';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS supported_pet_l2_ids JSONB DEFAULT '[]';
