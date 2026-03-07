-- i18n 품질 감사 쿼리
-- 용도: 번역 누락/키 리터럴 누출/패턴 오염 점검
-- 기본 범위: master/admin.master

WITH target AS (
  SELECT *
  FROM i18n_translations
  WHERE key LIKE 'master.%' OR key LIKE 'admin.master.%'
),
missing_lang AS (
  SELECT COUNT(*) AS c
  FROM target
  WHERE
    TRIM(COALESCE(ko, '')) = '' OR
    TRIM(COALESCE(en, '')) = '' OR
    TRIM(COALESCE(ja, '')) = '' OR
    TRIM(COALESCE(zh_cn, '')) = '' OR
    TRIM(COALESCE(zh_tw, '')) = '' OR
    TRIM(COALESCE(es, '')) = '' OR
    TRIM(COALESCE(fr, '')) = '' OR
    TRIM(COALESCE(de, '')) = '' OR
    TRIM(COALESCE(pt, '')) = '' OR
    TRIM(COALESCE(vi, '')) = '' OR
    TRIM(COALESCE(th, '')) = '' OR
    TRIM(COALESCE(id_lang, '')) = '' OR
    TRIM(COALESCE(ar, '')) = ''
),
key_literal AS (
  SELECT COUNT(*) AS c
  FROM target
  WHERE
    ko = key OR en = key OR ja = key OR zh_cn = key OR zh_tw = key OR
    es = key OR fr = key OR de = key OR pt = key OR vi = key OR th = key OR id_lang = key OR ar = key OR
    ko LIKE 'master.%' OR en LIKE 'master.%' OR ja LIKE 'master.%' OR
    zh_cn LIKE 'master.%' OR zh_tw LIKE 'master.%' OR es LIKE 'master.%' OR
    fr LIKE 'master.%' OR de LIKE 'master.%' OR pt LIKE 'master.%' OR
    vi LIKE 'master.%' OR th LIKE 'master.%' OR id_lang LIKE 'master.%' OR ar LIKE 'master.%'
),
disease_pattern AS (
  SELECT COUNT(*) AS c
  FROM target
  WHERE
    ko LIKE '%.disease_%' OR en LIKE '%.disease_%' OR ja LIKE '%.disease_%' OR
    zh_cn LIKE '%.disease_%' OR zh_tw LIKE '%.disease_%' OR es LIKE '%.disease_%' OR
    fr LIKE '%.disease_%' OR de LIKE '%.disease_%' OR pt LIKE '%.disease_%' OR
    vi LIKE '%.disease_%' OR th LIKE '%.disease_%' OR id_lang LIKE '%.disease_%' OR ar LIKE '%.disease_%'
)
SELECT
  (SELECT c FROM missing_lang) AS missing_language_rows,
  (SELECT c FROM key_literal) AS key_literal_rows,
  (SELECT c FROM disease_pattern) AS disease_pattern_rows,
  (
    (SELECT c FROM missing_lang) +
    (SELECT c FROM key_literal) +
    (SELECT c FROM disease_pattern)
  ) AS fail_count;
