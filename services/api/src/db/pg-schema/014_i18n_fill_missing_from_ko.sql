BEGIN;

UPDATE i18n_translations
SET
  ko = COALESCE(NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  en = COALESCE(NULLIF(BTRIM(en), ''), NULLIF(BTRIM(ko), ''), key),
  ja = COALESCE(NULLIF(BTRIM(ja), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  zh_cn = COALESCE(NULLIF(BTRIM(zh_cn), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  zh_tw = COALESCE(NULLIF(BTRIM(zh_tw), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  es = COALESCE(NULLIF(BTRIM(es), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  fr = COALESCE(NULLIF(BTRIM(fr), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  de = COALESCE(NULLIF(BTRIM(de), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  pt = COALESCE(NULLIF(BTRIM(pt), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  vi = COALESCE(NULLIF(BTRIM(vi), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  th = COALESCE(NULLIF(BTRIM(th), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  id_lang = COALESCE(NULLIF(BTRIM(id_lang), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  ar = COALESCE(NULLIF(BTRIM(ar), ''), NULLIF(BTRIM(ko), ''), NULLIF(BTRIM(en), ''), key),
  updated_at = NOW()
WHERE
  NULLIF(BTRIM(ko), '') IS NULL OR
  NULLIF(BTRIM(en), '') IS NULL OR
  NULLIF(BTRIM(ja), '') IS NULL OR
  NULLIF(BTRIM(zh_cn), '') IS NULL OR
  NULLIF(BTRIM(zh_tw), '') IS NULL OR
  NULLIF(BTRIM(es), '') IS NULL OR
  NULLIF(BTRIM(fr), '') IS NULL OR
  NULLIF(BTRIM(de), '') IS NULL OR
  NULLIF(BTRIM(pt), '') IS NULL OR
  NULLIF(BTRIM(vi), '') IS NULL OR
  NULLIF(BTRIM(th), '') IS NULL OR
  NULLIF(BTRIM(id_lang), '') IS NULL OR
  NULLIF(BTRIM(ar), '') IS NULL;

COMMIT;
