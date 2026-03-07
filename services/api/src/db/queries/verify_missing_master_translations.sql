-- Master category/item translation coverage audit
-- 목적:
-- 1) master 카테고리/아이템 중 i18n row 자체가 없는 데이터 찾기
-- 2) i18n row는 있지만 언어값이 비어 있는 데이터 찾기

-- A. 카테고리: i18n row 없음
SELECT
  'category_missing_i18n_row' AS issue_type,
  mc.id,
  mc.code AS category_code,
  ('master.' || mc.code) AS i18n_key
FROM master_categories mc
LEFT JOIN i18n_translations tr
  ON tr.key = ('master.' || mc.code)
WHERE tr.id IS NULL
ORDER BY mc.code;

-- B. 카테고리: 필수 언어(ko/en) 누락
SELECT
  'category_missing_required_lang' AS issue_type,
  mc.id,
  mc.code AS category_code,
  ('master.' || mc.code) AS i18n_key,
  COALESCE(tr.ko, '') AS ko,
  COALESCE(tr.en, '') AS en
FROM master_categories mc
JOIN i18n_translations tr
  ON tr.key = ('master.' || mc.code)
WHERE TRIM(COALESCE(tr.ko, '')) = ''
   OR TRIM(COALESCE(tr.en, '')) = ''
ORDER BY mc.code;

-- C. 아이템: i18n row 없음
SELECT
  'item_missing_i18n_row' AS issue_type,
  mi.id,
  mc.code AS category_code,
  mi.code AS item_code,
  ('master.' || mc.code || '.' || mi.code) AS i18n_key
FROM master_items mi
JOIN master_categories mc ON mc.id = mi.category_id
LEFT JOIN i18n_translations tr
  ON tr.key = ('master.' || mc.code || '.' || mi.code)
WHERE tr.id IS NULL
ORDER BY mc.code, mi.code;

-- D. 아이템: 필수 언어(ko/en) 누락
SELECT
  'item_missing_required_lang' AS issue_type,
  mi.id,
  mc.code AS category_code,
  mi.code AS item_code,
  ('master.' || mc.code || '.' || mi.code) AS i18n_key,
  COALESCE(tr.ko, '') AS ko,
  COALESCE(tr.en, '') AS en
FROM master_items mi
JOIN master_categories mc ON mc.id = mi.category_id
JOIN i18n_translations tr
  ON tr.key = ('master.' || mc.code || '.' || mi.code)
WHERE TRIM(COALESCE(tr.ko, '')) = ''
   OR TRIM(COALESCE(tr.en, '')) = ''
ORDER BY mc.code, mi.code;
