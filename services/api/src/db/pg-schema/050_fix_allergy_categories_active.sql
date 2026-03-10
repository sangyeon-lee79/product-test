-- Fix: allergy_type and allergy_group categories were 'inactive', causing 404 on /api/v1/master/allergy-groups
UPDATE master_categories SET status = 'active', updated_at = NOW() WHERE code = 'allergy_type' AND status = 'inactive';
UPDATE master_categories SET status = 'active', updated_at = NOW() WHERE code = 'allergy_group' AND status = 'inactive';
