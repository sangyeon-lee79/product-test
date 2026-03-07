-- Gate query for pre-deploy master i18n validation
-- fail_count > 0 이면 배포 차단

WITH
expected_i18n_keys AS (
  SELECT 'master.' || mc.code AS i18n_key
  FROM master_categories mc
  UNION
  SELECT 'master.' || mc.code || '.' || mi.code AS i18n_key
  FROM master_items mi
  JOIN master_categories mc ON mc.id = mi.category_id
),
missing_i18n_row AS (
  SELECT COUNT(*) AS c
  FROM expected_i18n_keys ek
  LEFT JOIN i18n_translations tr ON tr.key = ek.i18n_key
  WHERE tr.id IS NULL
),
missing_language_value AS (
  SELECT COUNT(*) AS c
  FROM i18n_translations tr
  WHERE (tr.key LIKE 'master.%' OR tr.key LIKE 'admin.master.%')
    AND (
      TRIM(COALESCE(tr.ko, '')) = '' OR
      TRIM(COALESCE(tr.en, '')) = '' OR
      TRIM(COALESCE(tr.ja, '')) = '' OR
      TRIM(COALESCE(tr.zh_cn, '')) = '' OR
      TRIM(COALESCE(tr.zh_tw, '')) = '' OR
      TRIM(COALESCE(tr.es, '')) = '' OR
      TRIM(COALESCE(tr.fr, '')) = '' OR
      TRIM(COALESCE(tr.de, '')) = '' OR
      TRIM(COALESCE(tr.pt, '')) = '' OR
      TRIM(COALESCE(tr.vi, '')) = '' OR
      TRIM(COALESCE(tr.th, '')) = '' OR
      TRIM(COALESCE(tr.id_lang, '')) = '' OR
      TRIM(COALESCE(tr.ar, '')) = ''
    )
),
key_literal_leak AS (
  SELECT COUNT(*) AS c
  FROM i18n_translations tr
  WHERE tr.key LIKE 'master.%'
    AND (
      tr.ko LIKE 'master.%' OR tr.en LIKE 'master.%' OR tr.ja LIKE 'master.%' OR
      tr.zh_cn LIKE 'master.%' OR tr.zh_tw LIKE 'master.%' OR tr.es LIKE 'master.%' OR
      tr.fr LIKE 'master.%' OR tr.de LIKE 'master.%' OR tr.pt LIKE 'master.%' OR
      tr.vi LIKE 'master.%' OR tr.th LIKE 'master.%' OR tr.id_lang LIKE 'master.%' OR tr.ar LIKE 'master.%'
    )
),
seed_parent_missing AS (
  SELECT COUNT(*) AS c
  FROM master_items mi
  JOIN master_categories mc ON mc.id = mi.category_id
  WHERE mc.code IN (
    'disease_type',
    'disease_device_type',
    'disease_measurement_type',
    'disease_measurement_context',
    'diet_subtype',
    'allergy_type'
  )
    AND mi.status = 'active'
    AND mi.parent_item_id IS NULL
),
seed_level_mismatch AS (
  SELECT COUNT(*) AS c
  FROM master_items mi
  JOIN master_categories mc ON mc.id = mi.category_id
  LEFT JOIN master_items p ON p.id = mi.parent_item_id
  LEFT JOIN master_categories pc ON pc.id = p.category_id
  WHERE mi.status = 'active'
    AND (
      (mc.code = 'disease_type' AND pc.code IS NOT NULL AND pc.code <> 'disease_group') OR
      (mc.code = 'disease_device_type' AND pc.code IS NOT NULL AND pc.code <> 'disease_type') OR
      (mc.code = 'disease_measurement_type' AND pc.code IS NOT NULL AND pc.code <> 'disease_device_type') OR
      (mc.code = 'disease_measurement_context' AND pc.code IS NOT NULL AND pc.code <> 'disease_measurement_type')
    )
)
SELECT
  (SELECT c FROM missing_i18n_row) AS missing_i18n_row_count,
  (SELECT c FROM missing_language_value) AS missing_language_value_count,
  (SELECT c FROM key_literal_leak) AS key_literal_leak_count,
  (SELECT c FROM seed_parent_missing) AS seed_parent_missing_count,
  (SELECT c FROM seed_level_mismatch) AS seed_level_mismatch_count,
  (
    (SELECT c FROM missing_i18n_row) +
    (SELECT c FROM missing_language_value) +
    (SELECT c FROM key_literal_leak) +
    (SELECT c FROM seed_parent_missing) +
    (SELECT c FROM seed_level_mismatch)
  ) AS fail_count;
