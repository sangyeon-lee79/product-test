-- 011: Service enhancements — pet type, cut style, supplier_available_cuts
-- Adds pet_type_l2_id and service_category_l3_id to services table
-- Creates supplier_available_cuts mapping table

-- [1-1] Add columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_category_l3_id TEXT REFERENCES master_items(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS pet_type_l2_id TEXT REFERENCES master_items(id);

CREATE INDEX IF NOT EXISTS idx_services_pet_type ON services(pet_type_l2_id);
CREATE INDEX IF NOT EXISTS idx_services_category_l3 ON services(service_category_l3_id);

-- [1-2] supplier_available_cuts — which cut styles each store can provide
CREATE TABLE IF NOT EXISTS supplier_available_cuts (
  id         TEXT PRIMARY KEY,
  store_id   TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  cut_item_id TEXT NOT NULL REFERENCES master_items(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, cut_item_id)
);

CREATE INDEX IF NOT EXISTS idx_supplier_cuts_store ON supplier_available_cuts(store_id);
