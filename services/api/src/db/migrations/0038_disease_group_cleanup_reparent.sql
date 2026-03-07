-- 0038: disease_group cleanup
-- Goal:
-- 1) Re-parent disease_type rows from legacy disease_group codes to normalized *_disease codes
-- 2) Deactivate legacy disease_group rows

-- Re-parent disease_type -> normalized disease_group
UPDATE master_items
SET
  parent_item_id = CASE
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'endocrine' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'endocrine_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'digestive' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'digestive_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'heart' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'cardiovascular_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'kidney_urinary' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'kidney_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'skin' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'skin_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'respiratory' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'respiratory_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'neurology' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'neurological_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'ophthalmology' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'eye_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'dental' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'dental_disease' LIMIT 1)
    WHEN parent_item_id = (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'musculoskeletal' LIMIT 1)
      THEN (SELECT id FROM master_items WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1) AND code = 'musculoskeletal_disease' LIMIT 1)
    ELSE parent_item_id
  END,
  updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_type' LIMIT 1)
  AND parent_item_id IN (
    SELECT id
    FROM master_items
    WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1)
      AND code IN ('endocrine','digestive','heart','kidney_urinary','skin','respiratory','neurology','ophthalmology','dental','musculoskeletal')
  );

-- Deactivate legacy disease_group rows (keep for history but hide in UI)
UPDATE master_items
SET status = 'inactive', updated_at = datetime('now')
WHERE category_id = (SELECT id FROM master_categories WHERE code='disease_group' LIMIT 1)
  AND code IN ('endocrine','digestive','heart','kidney_urinary','skin','respiratory','neurology','ophthalmology','dental','musculoskeletal');
