-- 091_store_address_business_type.sql — 매장 주소/업종 구조화 컬럼 추가
-- business_type/business_subtype: L1/L2 업종 코드
-- address_state_code/address_city_code/address_detail: 구조화된 주소

ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type    TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_subtype TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address_state_code TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address_city_code  TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address_detail     TEXT;

CREATE INDEX IF NOT EXISTS idx_stores_business_type ON stores(business_type);
CREATE INDEX IF NOT EXISTS idx_stores_state_code    ON stores(address_state_code);
