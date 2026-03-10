-- Fix business category L1/L2 items: ensure metadata contains item_level
-- and L2 items have correct parent_item_id.
-- Needed because ON CONFLICT DO NOTHING in 003 seed may have skipped updates
-- if items were previously inserted without these fields.

-- L1 items: set item_level
UPDATE master_items SET
  metadata = '{"item_level":"l1"}',
  updated_at = NOW()
WHERE id = 'mi-business-hospital' AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL);

UPDATE master_items SET
  metadata = '{"item_level":"l1"}',
  updated_at = NOW()
WHERE id = 'mi-business-grooming' AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL);

UPDATE master_items SET
  metadata = '{"item_level":"l1"}',
  updated_at = NOW()
WHERE id = 'mi-business-petshop' AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL);

UPDATE master_items SET
  metadata = '{"item_level":"l1"}',
  updated_at = NOW()
WHERE id = 'mi-business-hotel' AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL);

UPDATE master_items SET
  metadata = '{"item_level":"l1"}',
  updated_at = NOW()
WHERE id = 'mi-business-training' AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL);

-- L2 items: set parent_item_id + metadata
UPDATE master_items SET
  parent_item_id = 'mi-business-hospital',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-doctor';

UPDATE master_items SET
  parent_item_id = 'mi-business-hospital',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-nurse';

UPDATE master_items SET
  parent_item_id = 'mi-business-grooming',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-groomer';

UPDATE master_items SET
  parent_item_id = 'mi-business-grooming',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-stylist';

UPDATE master_items SET
  parent_item_id = 'mi-business-petshop',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-shop-manager';

UPDATE master_items SET
  parent_item_id = 'mi-business-petshop',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-consultant';

UPDATE master_items SET
  parent_item_id = 'mi-business-hotel',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-caretaker';

UPDATE master_items SET
  parent_item_id = 'mi-business-training',
  metadata = '{"item_level":"l2"}',
  updated_at = NOW()
WHERE id = 'mi-business-trainer';

-- L3 items: ensure metadata has item_level l3 (for any that might have been
-- inserted by older seed without proper metadata)
UPDATE master_items SET
  metadata = jsonb_set(metadata::jsonb, '{item_level}', '"l3"')::text,
  updated_at = NOW()
WHERE category_id = 'mc-business-category'
  AND id LIKE 'mi-svc-%'
  AND (metadata IS NULL OR metadata::jsonb->>'item_level' IS NULL OR metadata::jsonb->>'item_level' != 'l3');
