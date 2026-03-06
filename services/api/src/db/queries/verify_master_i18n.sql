-- Master i18n Verification Queries
-- 대상: page='master' AND key LIKE 'master.%'
-- DB: SQLite/D1 호환

-- -----------------------------------------------------------------------------
-- Q1) 마스터 키 대비 i18n 누락 키 확인
-- -----------------------------------------------------------------------------
WITH expected_keys AS (
  SELECT CASE WHEN mc.key LIKE 'master.%' THEN mc.key ELSE ('master.' || mc.key) END AS i18n_key
  FROM master_categories mc
  UNION
  SELECT CASE WHEN mc.key LIKE 'master.%' THEN (mc.key || '.' || mi.key) ELSE ('master.' || mc.key || '.' || mi.key) END AS i18n_key
  FROM master_items mi
  JOIN master_categories mc ON mc.id = mi.category_id
)
SELECT ek.i18n_key AS missing_i18n_key
FROM expected_keys ek
LEFT JOIN i18n_translations tr ON tr.key = ek.i18n_key
WHERE tr.id IS NULL
ORDER BY ek.i18n_key;

-- -----------------------------------------------------------------------------
-- Q2) master 번역 중 공란/NULL 필드가 있는 키
-- -----------------------------------------------------------------------------
SELECT key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar
FROM i18n_translations
WHERE page = 'master'
  AND key LIKE 'master.%'
  AND (
    ko IS NULL OR TRIM(ko) = '' OR
    en IS NULL OR TRIM(en) = '' OR
    ja IS NULL OR TRIM(ja) = '' OR
    zh_cn IS NULL OR TRIM(zh_cn) = '' OR
    zh_tw IS NULL OR TRIM(zh_tw) = '' OR
    es IS NULL OR TRIM(es) = '' OR
    fr IS NULL OR TRIM(fr) = '' OR
    de IS NULL OR TRIM(de) = '' OR
    pt IS NULL OR TRIM(pt) = '' OR
    vi IS NULL OR TRIM(vi) = '' OR
    th IS NULL OR TRIM(th) = '' OR
    id_lang IS NULL OR TRIM(id_lang) = '' OR
    ar IS NULL OR TRIM(ar) = ''
  )
ORDER BY key;

-- -----------------------------------------------------------------------------
-- Q3) 영어값 복사 의심 케이스 (비한국어 필드가 en과 동일)
-- 참고: 약어(DHPP/FVRCP/kg/lb)는 정상일 수 있음.
-- -----------------------------------------------------------------------------
SELECT key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar
FROM i18n_translations
WHERE page = 'master'
  AND key LIKE 'master.%'
  AND (
    (ja = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (zh_cn = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (zh_tw = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (es = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (fr = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (de = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (pt = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (vi = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (th = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (id_lang = en AND en IS NOT NULL AND TRIM(en) <> '') OR
    (ar = en AND en IS NOT NULL AND TRIM(en) <> '')
  )
ORDER BY key;

-- -----------------------------------------------------------------------------
-- Q4) 키 문자열 복사 의심 케이스 (예: en='master.pet_type.dog')
-- -----------------------------------------------------------------------------
SELECT key, ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar
FROM i18n_translations
WHERE page = 'master'
  AND key LIKE 'master.%'
  AND (
    en = key OR ja = key OR zh_cn = key OR zh_tw = key OR
    es = key OR fr = key OR de = key OR pt = key OR
    vi = key OR th = key OR id_lang = key OR ar = key
  )
ORDER BY key;

-- -----------------------------------------------------------------------------
-- Q5) 언어별 커버리지 요약 (master 키 기준)
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) AS total_master_keys,
  SUM(CASE WHEN ko IS NOT NULL AND TRIM(ko) <> '' THEN 1 ELSE 0 END) AS ko_filled,
  SUM(CASE WHEN en IS NOT NULL AND TRIM(en) <> '' THEN 1 ELSE 0 END) AS en_filled,
  SUM(CASE WHEN ja IS NOT NULL AND TRIM(ja) <> '' THEN 1 ELSE 0 END) AS ja_filled,
  SUM(CASE WHEN zh_cn IS NOT NULL AND TRIM(zh_cn) <> '' THEN 1 ELSE 0 END) AS zh_cn_filled,
  SUM(CASE WHEN zh_tw IS NOT NULL AND TRIM(zh_tw) <> '' THEN 1 ELSE 0 END) AS zh_tw_filled,
  SUM(CASE WHEN es IS NOT NULL AND TRIM(es) <> '' THEN 1 ELSE 0 END) AS es_filled,
  SUM(CASE WHEN fr IS NOT NULL AND TRIM(fr) <> '' THEN 1 ELSE 0 END) AS fr_filled,
  SUM(CASE WHEN de IS NOT NULL AND TRIM(de) <> '' THEN 1 ELSE 0 END) AS de_filled,
  SUM(CASE WHEN pt IS NOT NULL AND TRIM(pt) <> '' THEN 1 ELSE 0 END) AS pt_filled,
  SUM(CASE WHEN vi IS NOT NULL AND TRIM(vi) <> '' THEN 1 ELSE 0 END) AS vi_filled,
  SUM(CASE WHEN th IS NOT NULL AND TRIM(th) <> '' THEN 1 ELSE 0 END) AS th_filled,
  SUM(CASE WHEN id_lang IS NOT NULL AND TRIM(id_lang) <> '' THEN 1 ELSE 0 END) AS id_filled,
  SUM(CASE WHEN ar IS NOT NULL AND TRIM(ar) <> '' THEN 1 ELSE 0 END) AS ar_filled
FROM i18n_translations
WHERE page = 'master'
  AND key LIKE 'master.%';

-- -----------------------------------------------------------------------------
-- Q6) 우선순위 그룹 번역 상태 확인
-- -----------------------------------------------------------------------------
SELECT
  key,
  ko, en, ja, zh_cn, zh_tw, es, fr, de, pt, vi, th, id_lang, ar
FROM i18n_translations
WHERE key IN (
  'master.pet_type',
  'master.pet_breed',
  'master.pet_gender',
  'master.neuter_status',
  'master.life_stage',
  'master.body_size',
  'master.pet_color',
  'master.allergy_type',
  'master.disease_type',
  'master.symptom_type',
  'master.vaccination_type',
  'master.temperament_type'
)
ORDER BY key;
