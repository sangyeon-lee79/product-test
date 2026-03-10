-- Fix business category L2/L3 items: ensure parent_item_id is correctly set
-- Some rows may have NULL parent_item_id due to ON CONFLICT DO NOTHING in 003 seed

-- L2 items: set parent_item_id to their L1 parent
UPDATE master_items SET parent_item_id = 'mi-business-hospital', updated_at = NOW()
WHERE id = 'mi-business-doctor' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-hospital');

UPDATE master_items SET parent_item_id = 'mi-business-hospital', updated_at = NOW()
WHERE id = 'mi-business-nurse' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-hospital');

UPDATE master_items SET parent_item_id = 'mi-business-grooming', updated_at = NOW()
WHERE id = 'mi-business-groomer' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-grooming');

UPDATE master_items SET parent_item_id = 'mi-business-grooming', updated_at = NOW()
WHERE id = 'mi-business-stylist' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-grooming');

UPDATE master_items SET parent_item_id = 'mi-business-petshop', updated_at = NOW()
WHERE id = 'mi-business-shop-manager' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-petshop');

UPDATE master_items SET parent_item_id = 'mi-business-petshop', updated_at = NOW()
WHERE id = 'mi-business-consultant' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-petshop');

UPDATE master_items SET parent_item_id = 'mi-business-hotel', updated_at = NOW()
WHERE id = 'mi-business-caretaker' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-hotel');

UPDATE master_items SET parent_item_id = 'mi-business-training', updated_at = NOW()
WHERE id = 'mi-business-trainer' AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-training');

-- L3 grooming items -> parent: groomer
UPDATE master_items SET parent_item_id = 'mi-business-groomer', updated_at = NOW()
WHERE category_id = 'mc-business-category'
  AND id LIKE 'mi-svc-grooming-%'
  AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-groomer');

-- L3 hospital items -> parent: doctor
UPDATE master_items SET parent_item_id = 'mi-business-doctor', updated_at = NOW()
WHERE category_id = 'mc-business-category'
  AND id LIKE 'mi-svc-hospital-%'
  AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-doctor');

-- L3 training items -> parent: trainer
UPDATE master_items SET parent_item_id = 'mi-business-trainer', updated_at = NOW()
WHERE category_id = 'mc-business-category'
  AND id LIKE 'mi-svc-training-%'
  AND (parent_item_id IS NULL OR parent_item_id != 'mi-business-trainer');
