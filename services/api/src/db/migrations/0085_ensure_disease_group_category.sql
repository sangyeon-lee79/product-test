-- 0085: Ensure disease_group / disease_type categories exist and are usable in deployed SQLite/D1 DB

INSERT OR IGNORE INTO master_categories (id, code, sort_order, status, created_at, updated_at) VALUES
  ('mc-disease-group', 'disease_group', 123, 'active', datetime('now'), datetime('now')),
  ('mc-disease-type', 'disease_type', 124, 'active', datetime('now'), datetime('now'));

UPDATE master_categories
SET status = 'active', updated_at = datetime('now')
WHERE code IN ('disease_group', 'disease_type');

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-endocrine', c.id, NULL, 'endocrine', 1, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-cardiovascular-disease', c.id, NULL, 'cardiovascular_disease', 2, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-kidney-disease', c.id, NULL, 'kidney_disease', 6, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-skin-disease', c.id, NULL, 'skin_disease', 8, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

INSERT OR IGNORE INTO master_items (id, category_id, parent_item_id, code, sort_order, status, metadata, created_at, updated_at)
SELECT 'mi-dg-musculoskeletal-disease', c.id, NULL, 'musculoskeletal_disease', 13, 'active', '{}', datetime('now'), datetime('now')
FROM master_categories c WHERE c.code = 'disease_group';

UPDATE master_items
SET parent_item_id = 'mi-dg-endocrine', updated_at = datetime('now')
WHERE id = 'mi-dtype-diabetes'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

UPDATE master_items
SET parent_item_id = 'mi-dg-musculoskeletal-disease', updated_at = datetime('now')
WHERE id = 'mi-dtype-arthritis'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

UPDATE master_items
SET parent_item_id = 'mi-dg-cardiovascular-disease', updated_at = datetime('now')
WHERE id = 'mi-dtype-heart'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

UPDATE master_items
SET parent_item_id = 'mi-dg-kidney-disease', updated_at = datetime('now')
WHERE id = 'mi-dtype-kidney'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

UPDATE master_items
SET parent_item_id = 'mi-dg-skin-disease', updated_at = datetime('now')
WHERE id = 'mi-dtype-skin'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

UPDATE master_items
SET parent_item_id = 'mi-dg-endocrine', status = 'inactive', updated_at = datetime('now')
WHERE id = 'mi-dtype-none'
  AND category_id = (SELECT id FROM master_categories WHERE code = 'disease_type' LIMIT 1);

INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0085_ensure_disease_group_category');
