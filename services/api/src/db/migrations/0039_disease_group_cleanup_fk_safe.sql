-- 0039: disease_group cleanup (FK-safe)
-- Purpose:
-- 1) Re-parent disease_type from legacy disease_group codes to normalized *_disease codes
-- 2) Keep legacy groups but set inactive (no delete)

WITH map(legacy_code, normalized_code) AS (
  VALUES
    ('endocrine','endocrine_disease'),
    ('digestive','digestive_disease'),
    ('heart','cardiovascular_disease'),
    ('kidney_urinary','kidney_disease'),
    ('skin','skin_disease'),
    ('respiratory','respiratory_disease'),
    ('neurology','neurological_disease'),
    ('ophthalmology','eye_disease'),
    ('dental','dental_disease'),
    ('musculoskeletal','musculoskeletal_disease')
)
UPDATE master_items
SET
  parent_item_id = (
    SELECT n.id
    FROM master_items l
    JOIN map m ON m.legacy_code = l.code
    JOIN master_items n
      ON n.code = m.normalized_code
     AND n.category_id = l.category_id
    WHERE l.id = master_items.parent_item_id
    LIMIT 1
  ),
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
  AND parent_item_id IN (
    SELECT id
    FROM master_items
    WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1)
      AND code IN ('endocrine','digestive','heart','kidney_urinary','skin','respiratory','neurology','ophthalmology','dental','musculoskeletal')
  )
  AND EXISTS (
    SELECT 1
    FROM master_items l
    JOIN map m ON m.legacy_code = l.code
    JOIN master_items n
      ON n.code = m.normalized_code
     AND n.category_id = l.category_id
    WHERE l.id = master_items.parent_item_id
  );

UPDATE master_items
SET status = 'inactive', updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1)
  AND code IN ('endocrine','digestive','heart','kidney_urinary','skin','respiratory','neurology','ophthalmology','dental','musculoskeletal');
