-- 0043: Repair i18n rows that incorrectly stored key literals as translated values
-- 대상: master/admin.master 번역 데이터
-- 규칙:
-- 1) 번역값이 key 자체이거나 master.xxx/admin.xxx 패턴이면 잘못된 값으로 간주
-- 2) 잘못된 값을 NULL로 정리 후 ko/en 기준 fallback 채움
-- 3) 주요 샘플(심혈관 질환) 다국어를 명시 보정

-- A. ko가 key literal인 경우, key 기반 임시 ko 라벨 생성
UPDATE i18n_translations
SET ko = REPLACE(
           REPLACE(
             REPLACE(
               REPLACE(key, 'admin.master.', ''),
               'master.',
               ''
             ),
             '.',
             ' '
           ),
           '_',
           ' '
         ),
    updated_at = datetime('now')
WHERE (key LIKE 'master.%' OR key LIKE 'admin.master.%')
  AND (TRIM(COALESCE(ko, '')) = '' OR ko = key OR ko LIKE 'master.%' OR ko LIKE 'admin.%');

-- B. 잘못된 언어값 정리
UPDATE i18n_translations
SET
  en      = CASE WHEN en = key OR en LIKE 'master.%' OR en LIKE 'admin.%' THEN NULL ELSE en END,
  ja      = CASE WHEN ja = key OR ja LIKE 'master.%' OR ja LIKE 'admin.%' THEN NULL ELSE ja END,
  zh_cn   = CASE WHEN zh_cn = key OR zh_cn LIKE 'master.%' OR zh_cn LIKE 'admin.%' THEN NULL ELSE zh_cn END,
  zh_tw   = CASE WHEN zh_tw = key OR zh_tw LIKE 'master.%' OR zh_tw LIKE 'admin.%' THEN NULL ELSE zh_tw END,
  es      = CASE WHEN es = key OR es LIKE 'master.%' OR es LIKE 'admin.%' THEN NULL ELSE es END,
  fr      = CASE WHEN fr = key OR fr LIKE 'master.%' OR fr LIKE 'admin.%' THEN NULL ELSE fr END,
  de      = CASE WHEN de = key OR de LIKE 'master.%' OR de LIKE 'admin.%' THEN NULL ELSE de END,
  pt      = CASE WHEN pt = key OR pt LIKE 'master.%' OR pt LIKE 'admin.%' THEN NULL ELSE pt END,
  vi      = CASE WHEN vi = key OR vi LIKE 'master.%' OR vi LIKE 'admin.%' THEN NULL ELSE vi END,
  th      = CASE WHEN th = key OR th LIKE 'master.%' OR th LIKE 'admin.%' THEN NULL ELSE th END,
  id_lang = CASE WHEN id_lang = key OR id_lang LIKE 'master.%' OR id_lang LIKE 'admin.%' THEN NULL ELSE id_lang END,
  ar      = CASE WHEN ar = key OR ar LIKE 'master.%' OR ar LIKE 'admin.%' THEN NULL ELSE ar END,
  updated_at = datetime('now')
WHERE key LIKE 'master.%' OR key LIKE 'admin.master.%';

-- C. fallback 채움 (빈 번역 최소화)
UPDATE i18n_translations
SET
  en      = COALESCE(NULLIF(en, ''), ko),
  ja      = COALESCE(NULLIF(ja, ''), en, ko),
  zh_cn   = COALESCE(NULLIF(zh_cn, ''), en, ko),
  zh_tw   = COALESCE(NULLIF(zh_tw, ''), en, ko),
  es      = COALESCE(NULLIF(es, ''), en, ko),
  fr      = COALESCE(NULLIF(fr, ''), en, ko),
  de      = COALESCE(NULLIF(de, ''), en, ko),
  pt      = COALESCE(NULLIF(pt, ''), en, ko),
  vi      = COALESCE(NULLIF(vi, ''), en, ko),
  th      = COALESCE(NULLIF(th, ''), en, ko),
  id_lang = COALESCE(NULLIF(id_lang, ''), en, ko),
  ar      = COALESCE(NULLIF(ar, ''), en, ko),
  updated_at = datetime('now')
WHERE key LIKE 'master.%' OR key LIKE 'admin.master.%';

-- D. 명시 보정 예시: 심혈관 질환
UPDATE i18n_translations
SET
  ko      = '심혈관 질환',
  en      = 'Cardiovascular Disease',
  ja      = '心血管疾患',
  zh_cn   = '心血管疾病',
  zh_tw   = '心血管疾病',
  es      = 'Enfermedad cardiovascular',
  fr      = 'Maladie cardiovasculaire',
  de      = 'Herz-Kreislauf-Erkrankung',
  pt      = 'Doença cardiovascular',
  vi      = 'Bệnh tim mạch',
  th      = 'โรคหัวใจและหลอดเลือด',
  id_lang = 'Penyakit kardiovaskular',
  ar      = 'مرض القلب والأوعية الدموية',
  updated_at = datetime('now')
WHERE key = 'master.disease_group.cardiovascular_disease';
