-- Master category restructure cleanup
-- Request:
-- 1) remove allergy category from top-level
-- 2) remove medication_status category from top-level
-- 3) move coat_type under coat_length (L2)
-- 4) move activity_level under temperament_type (L2)
-- 5) move neuter_status under gender (L2)

-- A) Deactivate categories that should be removed from category list
UPDATE master_categories
SET status = 'inactive', updated_at = datetime('now')
WHERE code IN ('allergy_group', 'allergy_type', 'medication_status');

-- B) Keep moved categories active (used as L2 source)
UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('coat_type', 'activity_level', 'neuter_status', 'coat_length', 'temperament_type', 'gender');

-- C) Normalize moved category items to top-level so they can be shown as L2 fallback options
UPDATE master_items
SET parent_item_id = NULL, updated_at = datetime('now')
WHERE category_id IN (
  SELECT id FROM master_categories WHERE code IN ('coat_type', 'activity_level', 'neuter_status')
);
